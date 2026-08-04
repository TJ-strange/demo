import type { WorkspaceData } from "./types";

// Vite 会在构建时把 assets 目录里的静态资源纳入依赖图。
// 这里用 glob 预留图片/视频入口，后续你只需要把文件放进对应目录，Media 面板就能自动拿到真实路径。
export const assetModules = {
  images: import.meta.glob("../assets/images/*", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>,
  videos: import.meta.glob("../assets/videos/*", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>,
};

const firstImage = Object.values(assetModules.images)[0];
const firstVideo = Object.values(assetModules.videos)[0];

const getAssetFileName = (path: string) => path.split("/").at(-1) ?? path;

const imageAssets = Object.entries(assetModules.images).map(([path, src], index) => ({
  id: `media-image-${index + 1}`,
  taskId: "task-media",
  kind: "image" as const,
  title: { "zh-CN": getAssetFileName(path), "en-US": getAssetFileName(path) },
  description: {
    "zh-CN": getAssetFileName(path),
    "en-US": getAssetFileName(path),
  },
  src,
}));

const videoAssets = Object.entries(assetModules.videos).map(([path, src], index) => ({
  id: `media-video-${index + 1}`,
  taskId: "task-media",
  kind: "video" as const,
  title: { "zh-CN": getAssetFileName(path), "en-US": getAssetFileName(path) },
  description: {
    "zh-CN": getAssetFileName(path),
    "en-US": getAssetFileName(path),
  },
  src,
}));

const fallbackImageAsset = {
  id: "media-image",
  taskId: "task-media",
  kind: "image" as const,
  title: { "zh-CN": "图片预览占位", "en-US": "Image preview placeholder" },
  description: {
    "zh-CN": "把图片放到 src/assets/images 后，这里会优先使用真实资源。",
    "en-US": "Drop images into src/assets/images and this panel will prefer real assets.",
  },
  src: firstImage,
};

const fallbackVideoAsset = {
  id: "media-video",
  taskId: "task-media",
  kind: "video" as const,
  title: { "zh-CN": "视频预览占位", "en-US": "Video preview placeholder" },
  description: {
    "zh-CN": "把视频放到 src/assets/videos 后，可在这里预览。",
    "en-US": "Drop videos into src/assets/videos and preview them here.",
  },
  src: firstVideo,
};

// 整个 demo 的“后端数据源”都集中在这里。
// 这样做的好处是：UI、状态更新和 mock 数据边界清楚，之后接真实接口时也更容易替换。
export const initialWorkspaceData: WorkspaceData = {
  tasks: [
    {
      id: "task-interface",
      title: { "zh-CN": "构建 AI 工作台界面", "en-US": "Build AI workspace UI" },
      summary: {
        "zh-CN": "整理布局、状态和上下文预览。",
        "en-US": "Shape layout, status, and context preview.",
      },
      status: "completed",
      updatedAt: "19:26",
      accent: "done",
    },
    {
      id: "task-streaming",
      title: { "zh-CN": "模拟流式传输", "en-US": "Mock streaming output" },
      summary: {
        "zh-CN": "用前端分片生成回复和日志。",
        "en-US": "Generate replies and logs in frontend chunks.",
      },
      status: "running",
      updatedAt: "19:41",
      accent: "active",
    },
    {
      id: "task-media",
      title: { "zh-CN": "接入图片视频预览", "en-US": "Wire media preview" },
      summary: {
        "zh-CN": "预留 assets/images 和 assets/videos。",
        "en-US": "Reserve assets/images and assets/videos.",
      },
      status: "queued",
      updatedAt: "19:48",
      accent: "neutral",
    },
  ],
  messages: [
    {
      id: "msg-1",
      taskId: "task-streaming",
      role: "user",
      content: {
        "zh-CN": "mock 数据的 AI 工作台 demo。",
        "en-US": "Mock data AI workspace demo.",
      },
      createdAt: "19:38",
    },
    {
      id: "msg-2",
      taskId: "task-streaming",
      role: "assistant",
      content: {
        "zh-CN": "我会保留三栏工作台结构，并用 mock stream 模拟 AI 正在生成内容的过程。",
        "en-US": "I will keep a three-column workspace and use a mock stream to simulate AI generation.",
      },
      createdAt: "19:39",
    },
  ],
  files: [
    {
      id: "folder-src",
      name: "src",
      path: "src",
      type: "folder",
      children: [
        { id: "file-app", name: "App.tsx", path: "src/app/App.tsx", type: "file" },
        { id: "file-state", name: "workspaceState.ts", path: "src/state/workspaceState.ts", type: "file" },
        {
          id: "folder-assets",
          name: "assets",
          path: "src/assets",
          type: "folder",
          children: [
            { id: "folder-images", name: "images", path: "src/assets/images", type: "folder" },
            { id: "folder-videos", name: "videos", path: "src/assets/videos", type: "folder" },
          ],
        },
      ],
    },
  ],
  logs: [
    {
      id: "log-1",
      taskId: "task-streaming",
      level: "info",
      content: { "zh-CN": "读取 mock 任务上下文", "en-US": "Read mock task context" },
      time: "19:39:11",
    },
    {
      id: "log-2",
      taskId: "task-streaming",
      level: "success",
      content: { "zh-CN": "准备流式响应生成器", "en-US": "Prepared streaming response generator" },
      time: "19:39:18",
    },
  ],
  media: [
    ...imageAssets,
    ...videoAssets,
    ...(imageAssets.length === 0 ? [fallbackImageAsset] : []),
    ...(videoAssets.length === 0 ? [fallbackVideoAsset] : []),
  ],
};
