const PLATFORM = Process.platform;

const getMainModule = (version) => {
    if (PLATFORM === "windows") {
        return version >= 13331
            ? Process.findModuleByName("flue.dll")
            : Process.findModuleByName("WeChatAppEx.exe");
    }
    if (PLATFORM === "darwin") {
        return Process.findModuleByName("WeChatAppEx Framework");
    }
    return Process.findModuleByName("WeChatAppEx");
};

const sceneNeedsRewrite = (scene) => [
    1005, 1007, 1008, 1011, 1012, 1027, 1035, 1037,
    1053, 1074, 1145, 1168, 1178, 1256, 1260, 1302, 1308,
].includes(scene);

const patchCDPFilter = (base, config) => {
    // Newer WMPF builds serialize CDP messages through CastToJson.
    if (config.CastToJsonHookOffset &&
        (PLATFORM === "windows" || PLATFORM === "darwin")) {
        const castToJson = new NativeFunction(
            base.add(config.CastToJsonHookOffset),
            "pointer",
            ["pointer", "pointer"],
        );
        const callback = new NativeCallback(function (thiz, jsonOut, cborInput) {
            castToJson(jsonOut, cborInput);
            return jsonOut;
        }, "pointer", ["pointer", "pointer", "pointer"]);
        Interceptor.replace(base.add(config.CDPFilterHookOffset), callback);
        return;
    }

    // Fallback used by older WMPF builds.
    Interceptor.attach(base.add(config.CDPFilterHookOffset), {
        onLeave(retval) {
            try {
                const result = PLATFORM === "windows"
                    ? retval.readPointer()
                    : retval;
                if (result.isNull()) return;
                if (result.add(8).readU32() === 6) {
                    result.add(8).writeU32(0);
                }
            } catch (_) {
                // The filter is called frequently. A stale result is harmless.
            }
        },
    });
};

const configureModernWebSocket = (launchConfig, remoteDebugConfig, offsets) => {
    const websocketUrl = "ws://localhost:9421";
    const websocketUrlString = launchConfig.add(offsets.WebSocketURLStringOffset);
    const marker = websocketUrlString.add(23).readS8();
    if (marker < 0) {
        const data = websocketUrlString.readPointer();
        data.writeUtf8String(websocketUrl);
        websocketUrlString.add(8).writeU64(websocketUrl.length);
    } else {
        websocketUrlString.writeUtf8String(websocketUrl);
        websocketUrlString.add(23).writeU8(websocketUrl.length);
    }
    remoteDebugConfig.add(offsets.RemoteDebugModeOffset).writeInt(1);
    send("[hook] remote debug enabled, websocket=" + websocketUrl);
};

const handleOnLoadStart = (indexContainer, config) => {
    const offsets = config.MiniAppConfigStructOffsets || config.SceneOffsets;
    if (!offsets) return;

    let launchConfig;
    let remoteDebugConfig;
    let scenePtr;

    if (config.MiniAppConfigStructOffsets) {
        const launchOffsets = offsets.LaunchConfigOffsets;
        const remoteOffsets = offsets.RemoteDebugConfigOffsets;
        launchConfig = indexContainer
            .add(launchOffsets[0]).readPointer()
            .add(launchOffsets[1]).readPointer()
            .add(launchOffsets[2]).readPointer();
        remoteDebugConfig = launchConfig
            .add(remoteOffsets[0]).readPointer()
            .add(remoteOffsets[1]).readPointer();
        scenePtr = remoteDebugConfig.add(offsets.SceneOffset);
    } else {
        launchConfig = indexContainer
            .add(offsets[0]).readPointer()
            .add(offsets[1]).readPointer()
            .add(offsets[2]).readPointer();
        remoteDebugConfig = launchConfig
            .add(offsets[3]).readPointer()
            .add(offsets[4]).readPointer();
        scenePtr = remoteDebugConfig.add(offsets[5]);
    }

    const scene = scenePtr.readInt();
    send("[hook] scene=" + scene);
    if (sceneNeedsRewrite(scene)) {
        scenePtr.writeInt(1101);
        send("[hook] scene rewritten to 1101");
    }

    // The original implementation only configured miniapp scenes. Applying the
    // same callback to every WMPF page also exposes WeChat's embedded browser
    // and webview targets through the existing CDP proxy.
    if (config.MiniAppConfigStructOffsets) {
        configureModernWebSocket(launchConfig, remoteDebugConfig, offsets);
    }
};

const patchOnLoadStart = (base, config) => {
    Interceptor.attach(base.add(config.LoadStartHookOffset), {
        onEnter(args) {
            // Windows uses RDX for the debug flag. macOS uses the second ABI arg.
            if (PLATFORM === "windows") {
                if ((this.context.rdx & 0xff) !== 1) {
                    this.context.rdx = (this.context.rdx & ~0xff) | 1;
                }
            } else if (this.context.rsi) {
                this.context.rsi = (this.context.rsi & ~0xff) | 1;
            }

            try {
                handleOnLoadStart(args[0], config);
            } catch (e) {
                send("[hook] page debug setup skipped: " + e);
            }
        },
    });
};

const parseConfig = () => {
    const rawConfig = `@@CONFIG@@`;
    return rawConfig.includes("@@") ? null : JSON.parse(rawConfig);
};

const main = () => {
    const config = parseConfig();
    if (!config) {
        console.error("[frida] WMPF config is missing");
        return;
    }
    const module = getMainModule(config.Version);
    if (!module) {
        console.error("[frida] WMPF module not found for " + config.Version);
        return;
    }
    patchCDPFilter(module.base, config);
    patchOnLoadStart(module.base, config);
    send("[hook] WMPF " + config.Version + " ready for miniapp and embedded web pages");
};

main();
