# DEMO AI Workspace

纯前端 AI 工作台 demo，使用 mock 数据模拟 Codex-like 任务流、流式输出、上下文面板和媒体预览。

## 项目目标

这个项目不是完整后端产品，而是一个用来学习现代前端技术栈的 AI 工作台原型。它刻意保留了真实产品会遇到的几个前端问题：

- 三栏响应式布局：桌面端是任务栏、对话区、上下文区，移动端切换为抽屉。
- mock 流式输出：没有后端服务，但用 async generator 模拟 AI 分片回复。
- 国际化：支持中文和英文切换，并处理已有 mock 对话的语言 fallback。
- 媒体预览：约定图片和视频放到 `src/assets/images/` 与 `src/assets/videos/`。
- 微交互动画：用克制的动效提升反馈感，而不是做成营销页。

## 技术栈说明

### React 19

用途：构建组件化 UI，包括三栏布局、消息列表、输入框、设置面板和媒体预览。

优点：
- 生态成熟，学习资料多。
- 组件模型适合拆分复杂界面。
- 和 Jotai、i18next、Wouter 等库结合自然。

缺点：
- 状态和副作用需要明确分层，否则组件容易变臃肿。
- 对初学者来说，渲染时机、闭包和 hooks 依赖需要认真理解。

在本项目中解决的问题：把 AI 工作台拆成 `WorkspacePage`、`TaskSidebar`、`ConversationPanel`、`ContextPanel`、`Composer` 等可学习的组件。

### Vite / Vite+

用途：提供开发服务器、构建流程和工程命令入口。

优点：
- 启动快，HMR 体验好。
- Vite+ 可以统一 `dev`、`build`、`check` 等工程命令。
- 和现代 Oxc/Rolldown 工具链方向一致。

缺点：
- Vite+ 是相对新的工具，团队协作时需要保证成员本机环境一致。
- 某些插件生态仍然以标准 Vite 文档为主。

在本项目中解决的问题：用 `npm run dev/build/check` 保证普通 Vite 流程可用，同时预留 `vp:*` 脚本学习 Vite+。

### Wouter

用途：轻量路由，管理 `/tasks/:taskId` 和媒体预览 URL。

优点：
- API 小，学习成本低。
- 对 demo 和中小型 SPA 很合适。
- 不引入过重的路由抽象。

缺点：
- 大型应用里，数据加载、嵌套路由、路由守卫等能力需要自己组织。

在本项目中解决的问题：用非常轻的方式完成任务切换和 URL 状态表达。

### Tailwind CSS

用途：实现黑白灰极简设计系统、响应式布局、暗色主题和 UI 状态。

优点：
- 样式和组件结构放在一起，原型速度快。
- 适合沉淀 spacing、border、color、state 等规范。
- 响应式类名直观。

缺点：
- class 较长，需要组件拆分来保持可读性。
- 设计 token 如果没有约束，容易写出不统一的界面。

在本项目中解决的问题：快速实现桌面三栏、移动端抽屉、深浅主题和统一灰阶视觉。

### Jotai

用途：管理全局 UI 状态，比如当前任务、语言、主题、右侧 tab、是否正在生成。

优点：
- atom 模型简单，适合渐进式管理状态。
- 不需要很多模板代码。
- 组件只订阅自己需要的状态，拆分自然。

缺点：
- atom 多了以后需要良好的命名和目录组织。
- 复杂业务更新仍然需要配合清晰的数据修改策略。

在本项目中解决的问题：让任务选择、主题切换、语言切换和流式状态可以跨组件共享。

### ImmerJS

用途：更新复杂 mock 数据，比如追加消息、追加日志、更新任务状态。

优点：
- 可以用“看起来像可变”的写法安全更新不可变数据。
- 对嵌套数组和对象更新很友好。

缺点：
- 过度使用会隐藏数据变化成本。
- 简单 boolean/string 状态没有必要用 Immer。

在本项目中解决的问题：让 `workspaceAtom` 里的 messages、logs、tasks 更新更直观。

### i18next / react-i18next

用途：实现中文和英文 UI 文案切换。

优点：
- 生态成熟，React 绑定完善。
- 后续可以扩展命名空间、懒加载语言包。

缺点：
- mock 数据和用户生成内容需要额外设计，不是所有内容都天然有翻译。

在本项目中解决的问题：菜单、按钮、状态、设置项使用 i18n；已有对话使用 `getLocalizedText` 做 fallback，避免切换语言后空白。

### Oxc / Oxlint

用途：代码质量检查。

优点：
- Rust 实现，速度快。
- 适合学习新一代 JS 工具链。

缺点：
- 和 ESLint 生态相比，部分规则和插件能力还在演进。

在本项目中解决的问题：`npm run check` 会用 Oxlint 检查 `src` 和配置文件，再用 TypeScript 做类型检查。

### Originkit-style Microinteractions

用途：为输入框、任务卡片、消息出现、tab 切换、媒体预览增加交互动画。

优点：
- 可以让工具型界面更有反馈感。
- 适合局部增强，不破坏整体极简风格。

缺点：
- 动效过多会影响生产力工具的稳定感。
- 需要照顾 `prefers-reduced-motion`。

在本项目中解决的问题：用 CSS 微交互模拟 Originkit 风格，让 DEMO 有动态反馈但不过度装饰。

## Commands

```bash
npm install
npm run dev
npm run build
npm run check
```

如果本机已安装 Vite+，也可以使用：

```bash
npm run vp:dev
npm run vp:build
npm run vp:check
```

## GitHub Pages

这个项目部署到 GitHub Pages 的仓库路径是 `/demo/`，所以 `vite.config.ts` 里配置了：

```ts
base: "/demo/"
```

Wouter 也会读取 `import.meta.env.BASE_URL` 作为路由 base，因此线上路径可以是：

```txt
https://tj-strange.github.io/demo/tasks/task-media
```

GitHub Pages 是静态托管，直接访问 SPA 子路由时没有服务器 fallback。项目的 `postbuild` 会自动把 `dist/index.html` 复制成 `dist/404.html`，让子路由刷新或直达时仍然加载 React 应用。

```bash
npm run build
```

如果控制台出现 404，可以按 URL 判断：

- `/assets/...` 404：通常是没有使用带 `base: "/demo/"` 的最新构建产物。
- `/demo/tasks/...` 404：通常是缺少 `dist/404.html` fallback。
- `/demo/assets/*.jpg` 或 `/demo/assets/*.mov` 404：通常是图片/视频没有被提交到仓库，或 GitHub Pages 没部署最新 `dist`。

## Media Assets

后续图片和视频可以放在：

```txt
src/assets/images/
src/assets/videos/
```

项目会通过 `import.meta.glob` 自动读取这些目录下的资源，并在右侧 Media 面板中优先展示真实文件。
