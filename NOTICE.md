# Source and attribution notes

This repository is a compatibility source snapshot derived from the publicly available First source tree. Original project: [Spade-sec/First](https://github.com/Spade-sec/First).

The Windows compatibility change is in `src/engine.py`. It reads the WMPF runtime directory from the `WeChatAppEx.exe` command line before falling back to the executable path.

WMPF/CDP protocol and offset research was informed by [evi0s/WMPFDebugger](https://github.com/evi0s/WMPFDebugger), whose repository is GPLv2. Review the upstream license files before redistributing code taken directly from that project.

This repository preserves the original First attribution and reference links. Use the debugger only with targets you are authorized to inspect.
