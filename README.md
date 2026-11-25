# First · Windows 兼容版

这是 Kun686 维护的 First 兼容仓库，主要记录和修复 Windows 版微信更新后出现的小程序运行时识别问题。项目基于 First 早期公开的源码。上游 1.1.4 是单独发布的版本，本仓库的源码对应早期版本。

## 兼容性

已检查的环境为 Windows x64、微信 `4.2.1.9`、小程序运行时（WMPF）`26513`。微信升级后，旧版 First 可能报“找不到 WMPF 版本号”。这次修复让早期源码版优先读取运行时路径，并兼容旧版的可执行文件路径。验证覆盖版本识别和调试引擎初始化。

## 问题反馈

遇到兼容问题时，请附上 Windows、微信和 First 的版本，以及去除个人信息的报错原文。[提交 GitHub Issue](https://github.com/Kun686/First/issues)

## 参考与致谢

感谢 [Spade-sec/First](https://github.com/Spade-sec/First) 原作者和贡献者，特别是 [vs-olitus](https://github.com/vs-olitus)。

感谢 [evi0s/WMPFDebugger](https://github.com/evi0s/WMPFDebugger) 及其贡献者对 WMPF 兼容性的研究，也感谢原项目列出的 [HeartK](https://github.com/0xsdeo/HeartK)、[FindSomething](https://github.com/momosecurity/FindSomething) 和 [WMPFDebugger-mac](https://github.com/linguo2625469/WMPFDebugger-mac)。

详细来源和许可证提示见 [NOTICE.md](NOTICE.md)。
