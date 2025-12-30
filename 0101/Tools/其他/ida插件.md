# ida插件

## 1.常用插件

* 综合：https://github.com/KasperskyLab/hrtng
* 文件比对：https://github.com/google/bindiff, https://github.com/joxeankoret/diaphora
* 批量对比：https://github.com/chnzzh/batch-ida
* 文件功能识别：https://github.com/mandiant/capa
* 基于规则的vul分析：https://github.com/Accenture/VulFi
* 反llvm混淆：https://gitlab.com/eshard/d810
* 符合执行：https://github.com/illera88/Ponce
* 修改字节：https://github.com/keystone-engine/keypatch，https://github.com/gaasedelen/patching
* LazyIDA：https://github.com/L4ys/LazyIDA
* 识别枚举标准函数：https://github.com/junron/auto-enum
* 数据导出增强：https://github.com/Krietz7/IDA-DataExportPlus
* 覆盖范围探索：https://github.com/gaasedelen/lighthouse
* 查找加密常量：https://github.com/polymorf/findcrypt-yara
* 调用树图：https://github.com/herosi/CTO
* c++虚函数识别:https://github.com/kweatherman/IDA_ClassInformer_PlugIn
* llm逆向：https://github.com/JusticeRage/Gepetto, https://github.com/WPeace-HcH/WPeChatGPT
* mcp：https://github.com/mrexodia/ida-pro-mcp
* gdb：https://github.com/mahaloz/decomp2dbg
* 会话同步：https://github.com/calladoum-elastic/ret-sync
* 基于项目管理：https://github.com/P4nda0s/IDA-NO-MCP
* UEFI 固件分析和逆向：https://github.com/binarly-io/efiXplorer
* 开发：https://github.com/allthingsida/qscripts，https://github.com/ioncodes/idacode



## 2.插件开发

开发方式：

* C++ using the IDA SDK（推荐）
* Python via the IDAPython（推荐）
* IDC
* Domain API

ida9.0 后推出的新特性：idalib，支持 C++ SDK 和 IDA Python API 在外部独立应用中使用，也就是无头模式使用，使用时确保 idapro 作为第一个模块导入