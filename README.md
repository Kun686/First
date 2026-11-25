# First · Kun686 维护版

我平时需要分析微信小程序的页面、接口和运行过程，所以在 First 早期公开源码的基础上维护了这个版本。这个仓库主要解决 Windows 新版微信升级后，WMPF 版本识别失败、Frida 无法启动的问题。

## 我修了什么

微信 4.2.1.9 把 WMPF 版本放到了 `WeChatAppEx.exe` 的 `--flue-runtime-dir` 参数里。旧代码只看可执行文件路径，因此会出现：

```text
cannot detect WMPF version from path
```

我在 `src/engine.py` 中加入了新的识别路径：

- 读取 `--flue-runtime-dir` 参数。
- 兼容带等号和分离参数两种写法。
- 统一 Windows 路径分隔符。
- 保留旧版路径识别逻辑。
- 增加 WMPF 26513 偏移配置。
- 修正 Windows 启动脚本的换行格式。

我在 Windows x64、微信 4.2.1.9、WMPF 26513 环境中测试过版本识别和 Frida 引擎初始化。

## 功能

- Frida 注入微信 WMPF。
- 使用 Chrome DevTools 调试小程序页面。
- 调试云函数和 `wx.*` API。
- 枚举和跳转小程序路由。
- 解包 `wxapkg` 并扫描敏感信息。
- 加载自定义用户脚本。

## 运行源码

环境要求为 Python 3.10 或更高版本。Windows 下可以运行：

```powershell
uv sync
.\启动-修复版.bat
```

也可以直接运行：

```powershell
python gui.py
```

打开微信小程序后，在界面中点击启动，再用 Chrome 或 Edge 打开：

```text
devtools://devtools/bundled/inspector.html?ws=127.0.0.1:62000
```

如果只需要后台调试服务，不需要界面，可以运行：

```powershell
python main.py
```

对应的 Windows 后台 EXE 可以从 [Releases](https://github.com/Kun686/First/releases) 下载。

默认调试服务端口是 `9421`，CDP 代理端口是 `62000`。

## 配置

复制 [gui_config.example.json](gui_config.example.json) 为 `gui_config.json`，再按自己的端口和界面习惯修改。`gui_config.json` 已加入 `.gitignore`，不会被提交。

## 版本说明

我发布的是 First 后续版本闭源前的公开源码快照和兼容性修复。上游 1.1.4 的完整源码没有公开，因此这里的源码和 1.1.4 二进制发行版不是同一份源代码。

## 参考与致谢

感谢 [Spade-sec/First](https://github.com/Spade-sec/First) 的原作者和贡献者，特别是 [vs-olitus](https://github.com/vs-olitus)。

WMPF 和 CDP 的研究思路参考了 [evi0s/WMPFDebugger](https://github.com/evi0s/WMPFDebugger)。同时感谢 [HeartK](https://github.com/0xsdeo/HeartK)、[FindSomething](https://github.com/momosecurity/FindSomething) 和 [WMPFDebugger-mac](https://github.com/linguo2625469/WMPFDebugger-mac) 的作者与贡献者。

来源和许可证提示见 [NOTICE.md](NOTICE.md)。请只在自己拥有或明确获准测试的目标上使用。
