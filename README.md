# 轻笺 (QingJian) 设计方案 —— v1.3.13 实际落地版

> 本文档基于实际已实现的 Electron + CodeMirror 6 版本重写，替代早期 Tauri 预研方案，用于后续版本跟踪。

---

## 一、产品定位

| 维度 | 说明 |
|------|------|
| **目标用户** | 后端开发者、系统管理员、日常文本处理用户 |
| **核心价值** | 秒开、轻量、不臃肿、离线可用、自动更新 |
| **差异化** | 比 Notepad++ 更现代的 UI；比 Sublime Text 更自由；比 VS Code 更轻量 |
| **产品名** | 轻笺 (QingJian) — 取“轻巧笔记”之意 |
| **当前版本** | v1.3.13 |
| **运行平台** | Windows（安装版 + 便携版） |

---

## 二、实际技术选型（已落地）

早期曾调研 Tauri 2.0，后因开发效率与打包成熟度原因，实际采用 **Electron 43 + CodeMirror 6 + 原生 ES Modules** 方案。

| 对比项 | Electron + CM6（实际采用） | Electron + Monaco | Tauri + CM6 |
|--------|:-------------------------:|:-----------------:|:-----------:|
| 安装包体积 | ~125 MB | ~130 MB | ~10 MB |
| 内存占用 | ~150 MB | ~250 MB | ~60 MB |
| 冷启动速度 | ~500 ms | ~800 ms | ~300 ms |
| 跨平台 | Win/Mac/Linux（当前仅 Win） | 全平台 | 全平台 |
| 打包/自动更新 | 成熟（electron-updater） | 可用 | 生态成长中 |
| 开发效率 | 高 | 高 | 中高 |
| 离线可用 | 是 | 是 | 是 |

### 选择理由

1. **Electron 43**：成熟稳定，自动更新、系统托盘、本地文件访问等能力开箱即用；本机前端技术栈熟悉，调试成本低。
2. **CodeMirror 6**：模块化、增量解析、按需加载语言包，性能足以支撑大文件。
3. **原生 ES Modules**：无额外前端框架，打包产物极小，用户代码 < 1 MB。
4. **NSIS + 手写脚本**：完全可控安装路径、覆盖逻辑、图标注入与更新行为。

---

## 三、系统架构

```
┌───────────────────────────────────────────────────────────┐
│  Electron Main Process (main.js)                          │
│  窗口/Tray │ 本地 HTTP 服务 │ IPC │ 自动更新 │ 安全存储   │
├───────────────────────────────────────────────────────────┤
│  preload.js — 最小化暴露 electronAPI                      │
├───────────────────────────────────────────────────────────┤
│  Renderer Process (src/*.js)                              │
│  app.js(主逻辑) │ state.js │ ui.js │ settings.js          │
│  tabs │ language │ search │ spreadsheet │ formula         │
│  mindmap │ outline │ sidebar │ snippets │ vcs-ui          │
├───────────────────────────────────────────────────────────┤
│  CodeMirror 6 Engine                                      │
│  语法高亮 │ 行号 │ 搜索替换 │ 多光标 │ 代码折叠           │
└───────────────────────────────────────────────────────────┘
```

### 进程通信

- **Main → Renderer**：`BrowserWindow.webContents.send`
- **Renderer → Main**：`ipcRenderer.invoke('channel', ...args)`，经 `contextBridge` 暴露
- **本地 HTTP**：`main.js` 启动 `http-server`，`index.html` 经 `http://localhost:<port>/` 加载，满足 ES module 同源要求
- **安全策略**：CSP meta、`openFileByPath` 白名单、禁止 `..` 路径穿越、safeStorage 加密 VCS Token

---

## 四、项目目录结构

```
qingjian-electron/
├── main.js                  # 主进程：窗口、Tray、HTTP、IPC、自动更新
├── preload.js               # 安全桥接
├── package.json             # 应用版本、electron-builder 配置
├── app-update.yml           # 自动更新源配置（generic / GitHub CDN）
├── index.html               # 渲染入口
├── icon.ico / icon.png      # 应用图标（安装程序 / 托盘 / 窗口）
├── src/
│   ├── app.js               # 应用核心逻辑（原 4844 行已拆分为 14 模块后保留的主控）
│   ├── state.js             # 共享可变状态
│   ├── settings.js          # 用户偏好与 localStorage 持久化
│   ├── ui.js                # UI 渲染辅助
│   ├── tabs.js              # 标签页创建/切换/关闭
│   ├── language.js          # 语言包懒加载
│   ├── session.js           # 会话保存/恢复
│   ├── search.js            # 搜索面板
│   ├── sidebar.js           # 侧边栏/文件树
│   ├── outline.js           # 大纲视图
│   ├── mindmap.js           # 思维导图
│   ├── snippets.js          # 代码片段
│   ├── spreadsheet.js       # 电子表格
│   ├── formula.js           # 公式引擎（纯函数）
│   ├── vcs-ui.js            # VCS 远程文件浏览器
│   └── ...                  # 其他工具模块
├── scripts/
│   ├── inject_icon.py       # Win32 UpdateResource 图标注入
│   ├── gen-latest-yml.py    # 生成 latest.yml
│   ├── smoke-test.js        # 回归冒烟测试
│   ├── import-smoke.mjs     # 模块导出/导入检查
│   └── *_test.mjs           # 各模块单元测试
├── build/
│   ├── make_icon.py         # 从源图生成最终绿色圆角图标
│   ├── icon.ico / icon.png  # 最终图标产物
│   └── icon_75.ico / .png   # 历史中间图标（备份）
├── _overlay7/               # 安装包用图标 + 已注入图标的 QingJian.exe
├── _overlay9/               # 覆盖进安装包的 main.js/package.json/index.html
└── installer_build_*.nsi    # NSIS 安装脚本（当前 canonical：142/143）
```

---

## 五、核心功能设计

### 5.1 文件管理

| 功能 | 实现方式 |
|------|----------|
| 打开文件 | IPC `open-file-dialog` / 拖拽 / 最近文件 |
| 保存文件 | IPC `save-file` / `save-file-as`，Ctrl+S |
| 最近文件 | `localStorage` + 主进程 `recentFiles` |
| 文件监听 | Node `fs.watch` 200 ms 防抖，外部变更提示重载 |
| 大文件 | >5 MB 关闭语法高亮；>100 MB 只读；启动延迟显示 |

### 5.2 编码处理

- 默认 UTF-8
- 通过 CodeMirror 与浏览器原生能力处理常见编码
- 大文件不保存选区/撤销栈，避免内存爆炸

### 5.3 编辑器功能

| 功能 | 实现 |
|------|------|
| 语法高亮 | CodeMirror 6 `StreamLanguage` / 官方语言包 |
| 行号 | `@codemirror/gutter` |
| 代码折叠 | `@codemirror/language` foldService |
| 搜索替换 | `@codemirror/search` + 自定义面板 |
| 多光标 | CodeMirror 内置 |
| 括号匹配 | CodeMirror 内置 |
| 主题 | 浅色 / 深色，CSS 变量切换 |

### 5.4 语法支持

JavaScript/TypeScript、JSON、HTML、CSS、Python、Java、C/C++、Go、Rust、PHP、SQL、Shell、Markdown、XML、YAML、Vue、JSX/TSX 等。

### 5.5 主题系统

- 首次安装默认 **浅色主题**（`settings.theme = 'light'`）。
- 已保存偏好的用户升级后保留原主题。
- 主题切换通过修改 `document.body` class 与 CodeMirror 主题扩展实现。

### 5.6 快捷键

见 README.md「常用快捷键」。

### 5.7 电子表格

- 纯函数公式引擎 `formula.js`，零 DOM 依赖。
- 支持跨表引用（`Sheet2!A1`、`Sheet 1!A1`）、绝对引用、20+ 函数。
- 循环检测、错误值集（`#VALUE!`、`#REF!`、`#CIRC!` 等）。
- 编辑时仅标记脏单元格，显示时整表求值刷新，保证性能。
- 导入/导出 CSV、XLSX（导入保留公式）。

### 5.8 VCS 浏览器

- 支持 GitHub / Gitee / GitLab REST API。
- Token 用 `safeStorage` 加密存储（前缀 `enc:`）。
- 配置持久化到 `userData/vcs-config.json`。

### 5.9 思维导图

- 文本大纲转思维导图，支持节点展开/折叠。

---

## 六、自动更新设计

### 6.1 更新源

采用 `electron-updater` 的 **generic provider**，直接请求 GitHub Releases 的 `latest/download` 文件 CDN：

```js
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://github.com/lpf-exclusive/QingJian/releases/latest/download'
})
```

避免使用 `provider: 'github'`（底层请求 `api.github.com`，国内容易超时）。

### 6.2 配置清单

手写 NSIS 安装包需包含 `resources/app-update.yml`：

```yaml
provider: generic
url: https://github.com/lpf-exclusive/QingJian/releases/latest/download
```

### 6.3 原地安装

`electron-updater` 默认可能按注册表路径安装。为确保更新安装到当前目录，在 `main.js` 中显式设置：

```js
_autoUpdater.installDirectory = path.dirname(app.getPath('exe'))
```

安装包静默安装时带 `/D=当前目录`，实现原地升级。

### 6.4 发布流程

1. bump `package.json` 与 `_overlay9/dist_package.json`。
2. 生成 `installer_build_<N>.nsi`，编译安装包。
3. 运行 `scripts/gen-latest-yml.py` 生成 `latest.yml`。
4. GitHub Release 上传：
   - `QingJian-Setup-<版本>.exe`
   - `latest.yml`
5. 标记为 Latest Release。

---

## 七、图标与品牌

### 7.1 图标生成

`build/make_icon.py` 从源 PNG 提取白色“笺”字，重绘纯绿色圆角背景（`#4CAF50`），消除源图抗锯齿白边，输出：

- `build/icon.png`
- `build/icon.ico`
- 根目录 `icon.png` / `icon.ico`（供 NSIS MUI_ICON/MUI_UNICON 使用）

### 7.2 图标注入

Windows 应用图标通过 `scripts/inject_icon.py` 使用 `Win32 UpdateResource` 注入到 `QingJian.exe`，支持 16/24/32/48/64/128/256 多尺寸。

注入目标：

- `_overlay7/QingJian.exe`（安装包使用的 EXE）
- `QingJian-portable-v12/QingJian.exe`（便携版 EXE）

安装程序与卸载程序图标由 NSIS `MUI_ICON` / `MUI_UNICON` 读取根目录 `icon.ico`。

---

## 八、数据持久化

### 8.1 用户设置

`localStorage`：`qingjian-settings`

```json
{
  "theme": "light",
  "fontSize": 14,
  "fontFamily": "'JetBrains Mono', 'Consolas', monospace",
  "tabSize": 2,
  "wordWrap": true,
  "autoSave": true,
  "autoSaveDelay": 3000
}
```

### 8.2 会话恢复

`localStorage`：`qingjian-session`

保存：打开的文件路径、光标位置、未保存临时内容、侧边栏状态。

### 8.3 最近文件

`localStorage` + 主进程 `recentFiles` 数组，最多保留 N 条。

---

## 九、性能策略

| 场景 | 策略 |
|------|------|
| 大文件编辑 | 5–100 MB 可编辑但关闭语法高亮；>100 MB 硬只读 |
| 多标签页 | 非活动标签保留编辑器状态，DOM 切换 |
| 语法高亮 | CodeMirror 6 增量解析，按需加载语言包 |
| 文件搜索 | 主进程读取，结果分批返回 |
| 自动保存 | 3000 ms 防抖 |
| 文件监听 | 200 ms 防抖 |
| 启动速度 | 延迟显示窗口，IPC `app:ready` 8 秒超时兜底 |

---

## 十、安全策略

- **CSP**：`default-src 'self'`，`script-src 'unsafe-inline'`，`connect-src 'self' https:`
- **IPC 白名单**：`openFileByPath` 校验绝对路径，禁止 `..` 穿越
- **Token 加密**：VCS Token 用 Electron `safeStorage` 加密
- **文件删除**：尽量使用回收站机制（若平台支持）
- **ARIA**：核心对话框、右键菜单已加 `role` / `aria-*`

---

## 十一、开发路线图

### Phase 1 — MVP（已完成）
- [x] Electron 窗口 + 无边框标题栏 + 系统托盘
- [x] CodeMirror 6 集成
- [x] 文件打开/保存/另存为
- [x] 多标签页编辑
- [x] 基础语法高亮（JS/JSON/HTML/CSS/Python/Markdown）
- [x] 行号、搜索替换、跳转行
- [x] 浅色/深色主题

### Phase 2 — 功能完善（已完成）
- [x] 侧边栏文件树
- [x] 代码折叠、多光标
- [x] 主题切换、设置持久化
- [x] 最近文件列表
- [x] 拖拽打开文件
- [x] 代码片段
- [x] 大纲视图
- [x] 文件外部修改检测

### Phase 3 — 高级特性（已完成/进行中）
- [x] 电子表格 + 公式引擎
- [x] VCS 远程文件浏览器
- [x] 思维导图
- [x] 自动保存
- [x] 全局搜索
- [x] 自动更新（generic 源、原地安装）
- [x] 图标注入与浅色主题默认

### Phase 4 — 生态扩展（未来）
- [ ] 插件系统 API
- [ ] 设置面板 UI 化
- [ ] 更完善的大文件分块渲染
- [ ] 多窗口支持
- [ ] 插件市场（远期）
- [ ] macOS / Linux 适配评估

---

## 十二、构建与发布清单

每次发版必须完成：

- [ ] 修改 `main.js` / `src/*.js` 后运行 `node --check`
- [ ] 运行 `npm test`
- [ ] 同步 `_overlay9/dist_main.js`、`_overlay9/dist_package.json`、`_overlay9/index.html`
- [ ] 同步便携版 `resources/app/`
- [ ] 若更新图标，运行 `inject_icon.py` 注入 `_overlay7/QingJian.exe` 与便携版 EXE
- [ ] bump `package.json` 与 `_overlay9/dist_package.json`
- [ ] 复制并 sed 生成新 `installer_build_<N>.nsi`
- [ ] `makensis.exe` 编译
- [ ] `gen-latest-yml.py` 生成 `latest.yml`
- [ ] 静默安装实测（PowerShell `Start-Process -ArgumentList`）
- [ ] GitHub Release 上传 `*.exe` + `latest.yml`，标记 Latest

---

## 十三、关键踩坑记录（必读）

1. **NSIS `File /r /x "package.json"` 会全局排除 node_modules 里的 package.json**，导致 `electron-updater` 无法加载。修复：改为完整复制 + overlay 根文件。
2. **`index.html` 实际路径是 `resources/app/src/index.html`**，不是 `resources/app/index.html`。overlay 务必写对。
3. **NSIS `InstallDirRegKey` 在静默 `/S` 下会覆盖 `/D`**。v1.3.12 起已移除 `InstallDirRegKey`，靠 `installDirectory` + `/D` 原地升级。
4. **Git Bash 传 `/D=D:\Program Files (x86)\QingJian` 会被空格截断**。部署须用 PowerShell `Start-Process -ArgumentList` 数组形式。
5. **`provider:'github'` 走 `api.github.com`，国内超时**。务必用 `provider:'generic'` + GitHub 文件 CDN。
6. **electron-updater 仍需要 `resources/app-update.yml`**，手写 NSIS 必须补上。
7. **图标注入用 `_overlay7/icon.ico`**，若此处是中间产物（如 75% 图标），安装后应用图标仍是错的。注入前务必确认 `build/icon.ico` 是最终版。
8. **`settings.js` 默认 `theme: 'dark'` 会覆盖 `state.js` 的 `currentTheme: 'light'`**。首次安装默认浅色须在 `settings.js` 改默认值。

---

## 十四、总结

轻笺 v1.3.13 已具备稳定的编辑器核心、扩展视图、自动更新与品牌视觉。后续以**插件系统、设置面板 UI 化、跨平台评估**为主要方向。本文档随版本迭代持续更新。
