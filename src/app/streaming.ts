import type { Locale, LocalizedText } from "./types";

export interface MockStreamPlan {
  locale: Locale;
  segments: string[];
}

const responses: LocalizedText[] = [
  {
    "zh-CN":
      "Vite+ 是围绕 Vite 生态做的一层工程化入口，适合用来统一开发、构建、检查、测试等命令。\n\n它解决的问题是：前端项目里工具越来越多，开发者容易在 npm scripts、运行时、包管理器和检查工具之间来回切换。Vite+ 把这些流程收拢起来，让项目启动和维护更统一。\n\n优点是启动快、命令集中、适合学习现代前端工具链；缺点是生态还比较新，团队协作时需要确认每个人的环境一致。\n\n在这个 demo 里，Vite+ 的定位是工程入口，具体 UI 仍然由 React、Tailwind 和状态库完成。",
    "en-US":
      "Vite+ is an engineering layer around the Vite ecosystem. It is useful for unifying dev, build, check, and test commands.\n\nThe problem it solves is tool fragmentation. Frontend projects often juggle npm scripts, runtimes, package managers, and code-quality tools. Vite+ brings those flows into a more consistent workflow.\n\nIts strengths are fast startup, centralized commands, and a good learning path for modern frontend tooling. Its limitation is that the ecosystem is still young, so teams need to align their local environments.\n\nIn this demo, Vite+ acts as the project entry point, while React, Tailwind, and state libraries handle the actual UI.",
  },
  {
    "zh-CN":
      "Wouter 是一个轻量 React 路由库，适合中小型 SPA 或 demo 项目。\n\n它解决的问题是：很多界面只需要简单 URL 状态，比如当前任务、当前详情页，并不一定需要大型路由框架。Wouter 用很少的 API 就能完成 `Route`、`Link`、重定向和参数读取。\n\n优点是体积小、学习成本低、写法直接；缺点是大型应用里的复杂能力，比如数据加载策略、嵌套路由治理、权限路由等，需要自己组织。\n\n在这个 demo 里，Wouter 用来表达 `/tasks/:taskId`，让左侧任务切换和浏览器 URL 保持一致。",
    "en-US":
      "Wouter is a lightweight React routing library, especially suitable for small to medium SPAs and demos.\n\nThe problem it solves is simple URL state. Many interfaces only need routes for things like the current task or detail view, without a large routing framework. Wouter provides `Route`, `Link`, redirects, and params with a very small API.\n\nIts strengths are small size, low learning cost, and direct usage. Its limitation is that larger app concerns like data loading, nested route governance, and permission routing need to be organized by the app itself.\n\nIn this demo, Wouter powers `/tasks/:taskId`, keeping task switching and the browser URL in sync.",
  },
  {
    "zh-CN":
      "Jotai + Immer 很适合这个 demo 里的状态模型：Jotai 负责状态拆分，Immer 负责复杂数据更新。\n\n它解决的问题是：AI 工作台会同时有当前任务、主题、语言、抽屉开关、生成状态、消息列表、日志、媒体资源等数据。如果全部塞进一个大 store，组件会变得难读；如果到处散落 useState，又很难共享。\n\nJotai 的优点是 atom 粒度灵活，组件只订阅自己需要的状态；Immer 的优点是可以用接近可变写法来安全更新嵌套数据。缺点是 atom 多了要注意命名和组织，Immer 也不适合滥用在简单 boolean 上。\n\n在这个 demo 里，Jotai 管 UI 状态，Immer 管 workspace mock 数据的追加消息、状态变更和日志更新。",
    "en-US":
      "Jotai + Immer fits this demo's state model well: Jotai splits state into small atoms, while Immer handles complex data updates.\n\nThe problem it solves is mixed UI and workspace data. An AI workspace has current task, theme, language, drawer state, generation status, messages, logs, and media assets. A single large store can become hard to read, while scattered useState calls are hard to share.\n\nJotai's strength is flexible atom granularity: components subscribe only to what they need. Immer's strength is safe nested updates with code that looks mutable. The tradeoff is that atoms need good organization, and Immer should not be overused for simple booleans.\n\nIn this demo, Jotai manages UI state, while Immer updates workspace mock data such as messages, task status, and logs.",
  },
  {
    "zh-CN":
      "Oxc 是新一代 JavaScript 工具链，包含 parser、linter、formatter、transformer 等方向，核心特点是 Rust 实现和高性能。\n\n它解决的问题是：传统 JS 工具链在大型项目里可能变慢，尤其是 lint、parse、transform 这些高频步骤。Oxc 试图用更快的底层实现提升工程反馈速度。\n\n优点是速度快、工具链方向完整、适合和 Vite+ 这类现代工程入口一起学习；缺点是生态仍在发展中，部分规则、插件和团队迁移经验不如 ESLint 成熟。\n\n在这个 demo 里，我们主要通过 Oxlint 使用 Oxc，让 `npm run check` 可以快速检查源码，同时保留 TypeScript 类型检查。",
    "en-US":
      "Oxc is a next-generation JavaScript toolchain covering areas like parsing, linting, formatting, and transforming. Its core strength is Rust-based performance.\n\nThe problem it solves is feedback speed. Traditional JS tooling can become slow in large projects, especially for frequent steps like linting, parsing, and transforming. Oxc aims to make those steps faster.\n\nIts strengths are speed, a broad toolchain direction, and strong alignment with modern setups like Vite+. Its limitation is ecosystem maturity: some rules, plugins, and migration patterns are less mature than ESLint's.\n\nIn this demo, we mainly use Oxc through Oxlint so `npm run check` can quickly inspect source quality while TypeScript still handles type checking.",
  },
];

function createAbortError() {
  return new DOMException("The stream was aborted.", "AbortError");
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const cleanup = () => signal?.removeEventListener("abort", abort);
    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const abort = () => {
      window.clearTimeout(timer);
      cleanup();
      reject(createAbortError());
    };

    signal?.addEventListener("abort", abort, { once: true });
  });
}

export function createMockStreamPlan(locale: Locale): MockStreamPlan {
  const response = responses[Math.floor(Math.random() * responses.length)] ?? responses[0];
  const text = response[locale];
  return {
    locale,
    segments: text.match(/.{1,3}/g) ?? [text],
  };
}

export async function* streamMockPlan(plan: MockStreamPlan, startIndex: number, signal?: AbortSignal) {
  for (let index = startIndex; index < plan.segments.length; index += 1) {
    if (signal?.aborted) throw createAbortError();
    // eslint-disable-next-line no-await-in-loop -- streaming chunks must arrive sequentially.
    await delay(18 + Math.random() * 120, signal);
    yield {
      chunk: plan.segments[index] ?? "",
      nextIndex: index + 1,
    };
  }
}

export async function* mockAssistantStream(locale: Locale, signal?: AbortSignal) {
  const plan = createMockStreamPlan(locale);

  for await (const item of streamMockPlan(plan, 0, signal)) {
    // eslint-disable-next-line no-await-in-loop -- streaming chunks must arrive sequentially.
    yield item.chunk;
  }
}
