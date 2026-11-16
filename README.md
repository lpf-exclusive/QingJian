# 轻笺 (QingJian)

一款基于 Tauri 2 + CodeMirror 6 的轻量级跨平台文本/代码编辑器，追求「秒开、不臃肿、可离线使用」。

🌐 官方主页：[https://lpf-exclusive.github.io/QingJian/](https://lpf-exclusive.github.io/QingJian/)

---

## 简介

轻笺是一款面向开发者和日常文本处理用户的轻量编辑器，采用 Tauri 2（Rust）+ CodeMirror 6 实现，数据存本地、零后端、无需登录。当前版本已实现多标签编辑、语法高亮、Markdown 分屏预览与导出（HTML / PDF / Word）、AI 助手、侧边待办面板、数学公式（KaTeX）、电子表格、VCS 浏览、思维导图、本地加密文件与签名自动更新等能力。

- **安装包体积**：Windows 安装版与 Linux deb 均为数 MB 量级，精确体积以 [最新 Release](https://github.com/lpf-exclusive/QingJian/releases/latest) 的资产为准
- **运行平台**：Windows（nsis 安装版）与 Linux（deb，需系统 WebKit2GTK 4.1）
- **当前版本**：![当前版本](https://img.shields.io/github/v/release/lpf-exclusive/QingJian?label=version&color=018B8D)（徽章实时读取 GitHub Releases，无需手工维护；Windows / Linux 双平台已发布）

---

## 功能特性

### 编辑器核心
- 多标签页编辑，支持拖拽排序
- 基于 CodeMirror 6 的语法高亮、行号、代码折叠、括号匹配
- 语言高亮扩展：JavaScript/TypeScript、JSON、HTML、CSS、Python、Markdown、SQL、YAML、Shell 等 10 类；其余格式按文本或流模式打开
- 大文件分级：>50 MB 关闭语法高亮保证流畅；>150 MB 强制只读兜底；文本读取上限 250 MB、二进制 300 MB
- 查找/替换（支持正则）、跳转行、全局搜索（在文件中查找）
- 主题切换：浅色 / 深色 / 跟随系统（首次安装默认浅色；在「设置 → 外观 → 主题」中调整）
- 字体、字号、自动换行、缩进等偏好设置
- Markdown 写作：分屏预览 / 仅预览 / 脑图模式；大纲导航按标题生成并跳转
- 专注模式（Zen，Esc 退出）、字数统计与写作目标、命令面板快捷命令
- 数学公式渲染（KaTeX）：行内 `$...$`、块级 `$$...$$`，Markdown 预览与 AI 对话均支持

### 文件与会话
- 本地文件打开 / 保存 / 另存为 / 拖拽打开
- 最近文件列表
- 会话恢复（未保存的临时内容不会丢失）
- 文件外部修改监听与提示
- 自动保存（默认 3 秒防抖）
- 导出：Markdown（保存即 .md）、HTML、PDF、Word（.docx）
- 本地加密文件 + 恢复密钥

### 扩展视图
- 侧边栏：打开的文件、大纲视图、代码片段
- 电子表格：公式、跨表引用、20+ 内置函数，Excel（.xlsx / .xls）导入导出；CSV 按普通文本打开
- 思维导图：Markdown 标题大纲转 SVG 脑图，点节点可跳到对应行
- 侧边待办面板：自动收集当前文档里的 Markdown 任务项（`- [ ]` / `- [x]`），集中查看并勾选切换完成状态，改动写回文档（代码块里的伪待办不会被误收）

### 远程仓库（VCS 浏览）
- 支持 GitHub / Gitee / GitLab，填入访问令牌即可连接
- 在编辑器内浏览远程仓库的目录与文件树，无需把整个仓库 clone 到本地
- 远程文件可在标签页中打开编辑，并支持推送 / 拉取、新建文件夹 / 删除 / 重命名、提交历史与分支切换
- 完整本地 Git 工作流（合并、变基等）仍在你惯用的工具中完成

### AI 助手
- 右侧对话栏：点侧边栏 ✨ 或 Ctrl+Shift+A 唤出（启动时默认关闭）；以选区为上下文，无选区时按上下文上限取全文，支持流式输出与多轮对话
- BYOK 模式：填入一个 API Key 即用，核心编辑器零强制联网、不依赖云端账号
- 内置 20 个策展模型（deepseek / qwen / kimi / glm / doubao / mistral 等）；专业用户可配付费 Key 解锁更强模型
- 10 个内联动作：润色 / 续写 / 缩写 / 扩写 / 翻译（英、中）/ 解释 / 正式 / 口语 / 活泼语气；触发方式：选区浮层「✨ AI」按钮、右键菜单、命令面板
- 支持视觉的模型可附加图片（deepseek-flash、qwen-max、kimi-k2.6、glm-5.3-flash、doubao-seed-2.1-pro）；仅视觉模型显示附件入口
- 自定义系统提示词（设置 → AI 助手）：为 AI 设定默认角色与行为，对全部对话与内联动作生效
- 结果一键复制、替换原文或插入光标处
- API Key 由 Rust 侧写入操作系统凭据库（Windows Credential Manager / macOS Keychain / Linux Secret Service），明文不落盘，对话数据不出本机

### 系统与更新
- 自定义无边框窗口 + 系统托盘
- 关闭窗口不退出（默认最小化到托盘，可在设置中改为退出）
- 内置自动更新：启动时静默检查，状态栏角标 / 托盘系统通知 / 更新小窗提示；下载完成确认后重启安装，保持安装路径与历史配置不变
- 更新包经 minisign 签名校验（`requireSignedVersion`），校验不通过不会安装
- 偏好设置：字体、字号、换行、缩进、主题、AI 助手、数据备份、诊断等

---

## 安装与使用

### Windows 安装版（推荐）

前往 [最新 Release](https://github.com/lpf-exclusive/QingJian/releases/latest) 下载 Windows 安装版（`QingJian_*_x64-setup.exe`），双击运行，按向导完成安装即可。

> Tauri 2 版本不再提供便携版 / 免安装版；历史便携版属已冻结的 Electron 版本。

### Linux（deb）

在 [最新 Release](https://github.com/lpf-exclusive/QingJian/releases/latest) 下载 deb 包（`QingJian_*_amd64.deb`，适用于 Ubuntu / Debian，需系统 WebKit2GTK 4.1），在下载目录执行：

```bash
sudo apt install ./QingJian_*_amd64.deb
```

### 首次启动

首次安装默认使用 **浅色主题**；可在「设置 → 外观 → 主题」中切换为深色，或选择「跟随系统」自动适配。

---

## 自动更新说明

轻笺内置自动更新机制，默认无需手动干预：

1. 启动后在后台静默检查 GitHub Releases 上的 `latest.json`（非开发构建）。
2. 发现新版本时，状态栏与托盘出现角标并推送系统通知；也可通过托盘菜单「检查更新」手动触发。
3. 更新小窗展示版本信息并下载；下载完成后弹出原生确认框「是否立即重启安装？」（状态栏亦可点「重启安装」）。
4. 确认后由 Tauri updater 安装（Windows 拉起 NSIS 安装包）并重启，安装路径与历史偏好、配置均保留。

- 下载的更新包与清单均经 minisign 签名校验，校验不通过不会安装。
- 检查请求带 15 秒超时与最多 3 次退避重试；更新源返回 404 时按「无可用更新」处理。
- 更新源与安装包托管于 GitHub Releases：`https://github.com/lpf-exclusive/QingJian/releases`。

---

## 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + N | 新建文件 |
| Ctrl + O | 打开文件 |
| Ctrl + S | 保存 |
| Ctrl + W | 关闭标签页 |
| Ctrl + F | 查找 |
| Ctrl + H | 替换 |
| Ctrl + G | 跳转行 |
| Ctrl + Shift + F | 在文件中查找（全局搜索） |
| Ctrl + Shift + P | 命令面板 |
| Ctrl + Shift + A | AI 助手（打开/聚焦对话栏） |
| Ctrl + K | 代码片段库 |
| Ctrl + Alt + S | 代码截图 |
| Ctrl + + / - | 放大 / 缩小字体 |
| Ctrl + 0 | 重置字体 |

完整快捷键见应用内命令面板（Ctrl+Shift+P）→「快捷键一览」。

---

## 技术栈

- **Tauri 2（Rust）**：窗口管理、系统托盘、文件系统、OS 凭据库、AI 请求代理、更新安装
- **CodeMirror 6**：编辑器核心、语法高亮、搜索替换
- **NSIS / deb**：Windows 安装程序与 Linux 软件包
- **tauri-plugin-updater + minisign**：自动更新与签名校验

---

## 路线图

### 已落地（v2.0.x）
- [x] 基础编辑器与多标签页
- [x] 语法高亮与语言懒加载
- [x] 打开的文件面板、大纲、代码片段
- [x] 搜索替换、跳转行、主题切换
- [x] 电子表格与公式引擎
- [x] VCS 远程文件浏览器
- [x] 思维导图（Markdown 大纲 → 脑图）
- [x] 签名自动更新（minisign）
- [x] 图标注入与浅色主题默认
- [x] 设置面板 UI 化（多标签：外观 / 编辑器 / 通用 / 远程仓库 / AI 助手 / 数据备份 / 诊断）
- [x] Tauri 2 迁移（Electron → Rust + WebView）
- [x] Linux（deb）适配与双平台发布
- [x] Markdown 分屏预览、KaTeX 数学公式、专注模式、字数统计、命令面板
- [x] 导出 Word（.docx）与侧边待办面板
- [x] AI 对话栏（BYOK、多轮、流式、多模态图片、自定义系统提示词）
- [x] 本地加密文件 + 恢复密钥

### 未来计划
- [ ] 插件系统 API
- [ ] 更完善的大文件分块渲染
- [ ] 多窗口支持
- [ ] macOS 适配评估

---

## 反馈与建议

轻笺不收集任何遥测，你的反馈是改进的唯一来源。欢迎在 GitHub 提交 Issue：
[在 GitHub 提反馈](https://github.com/lpf-exclusive/QingJian/issues/new?template=feedback.md&labels=feedback&title=[反馈]%20&body=版本：%0A系统：%0A现象描述：%0A)

---

## 许可证

Copyright © 2026 QingJian. All rights reserved.
