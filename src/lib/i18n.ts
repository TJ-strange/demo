import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
  "zh-CN": {
    translation: {
      app: {
        tagline: "AI 工作台前端 Demo",
        project: "本地 Mock 项目",
        running: "正在生成",
        idle: "准备就绪",
      },
      nav: {
        tasks: "任务",
        newTask: "新任务",
      },
      tabs: {
        files: "文件",
        logs: "日志",
        media: "媒体",
        settings: "设置",
      },
      composer: {
        placeholder: "输入一个任务，模拟 AI 流式回复...",
        mediaPlaceholder: "输入文案图片或者视频",
        send: "发送",
        generating: "生成中",
      },
      status: {
        queued: "排队中",
        running: "运行中",
        completed: "已完成",
      },
      settings: {
        title: "偏好设置",
        language: "语言",
        theme: "主题",
        light: "浅色",
        dark: "深色",
        motion: "交互动画",
        motionHint: "当前 demo 使用克制的 Originkit 风格微交互。",
      },
      media: {
        empty: "暂无真实媒体资源",
        imageHint: "将图片放入 src/assets/images",
        videoHint: "将视频放入 src/assets/videos",
      },
    },
  },
  "en-US": {
    translation: {
      app: {
        tagline: "AI workspace frontend demo",
        project: "Local mock project",
        running: "Generating",
        idle: "Ready",
      },
      nav: {
        tasks: "Tasks",
        newTask: "New task",
      },
      tabs: {
        files: "Files",
        logs: "Logs",
        media: "Media",
        settings: "Settings",
      },
      composer: {
        placeholder: "Type a task to simulate streamed AI output...",
        mediaPlaceholder: "Type image or video copy",
        send: "Send",
        generating: "Generating",
      },
      status: {
        queued: "Queued",
        running: "Running",
        completed: "Completed",
      },
      settings: {
        title: "Preferences",
        language: "Language",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        motion: "Interaction motion",
        motionHint: "This demo uses restrained Originkit-style microinteractions.",
      },
      media: {
        empty: "No real media assets yet",
        imageHint: "Place images in src/assets/images",
        videoHint: "Place videos in src/assets/videos",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh-CN",
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
