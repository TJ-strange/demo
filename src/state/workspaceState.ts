import { atom } from "jotai";
import { produce } from "immer";
import { initialWorkspaceData } from "../app/mockData";
import type { ContextTab, Locale, MediaKind, Message, TaskStatus, WorkspaceData } from "../app/types";

export const workspaceAtom = atom<WorkspaceData>(initialWorkspaceData);
// 当前任务 id 是路由和业务状态之间的桥：URL 变化会同步到这里，其他组件只读 atom。
export const currentTaskIdAtom = atom(initialWorkspaceData.tasks[1]?.id ?? initialWorkspaceData.tasks[0].id);
export const activeContextTabAtom = atom<ContextTab>("logs");
export const localeAtom = atom<Locale>("zh-CN");
export const themeAtom = atom<"light" | "dark">("light");
export const selectedAssetIdAtom = atom<string | null>(initialWorkspaceData.media[0]?.id ?? null);
export const isGeneratingAtom = atom(false);
export const leftDrawerOpenAtom = atom(false);
export const rightDrawerOpenAtom = atom(false);

export const currentTaskAtom = atom((get) => {
  // 派生 atom 只负责“读 + 计算”，不持有额外状态，避免 currentTask 与 taskId 不一致。
  const data = get(workspaceAtom);
  const id = get(currentTaskIdAtom);
  return data.tasks.find((task) => task.id === id) ?? data.tasks[0];
});

export const currentMessagesAtom = atom((get) => {
  // 消息全部存在 workspaceAtom 中，展示时再按当前 taskId 过滤。
  const id = get(currentTaskIdAtom);
  return get(workspaceAtom).messages.filter((message) => message.taskId === id);
});

export const currentLogsAtom = atom((get) => {
  const id = get(currentTaskIdAtom);
  return get(workspaceAtom).logs.filter((log) => log.taskId === id);
});

export const selectedAssetAtom = atom((get) => {
  const data = get(workspaceAtom);
  const id = get(selectedAssetIdAtom);
  return data.media.find((asset) => asset.id === id) ?? data.media[0] ?? null;
});

export const taskMediaAtom = atom((get) => {
  const id = get(currentTaskIdAtom);
  const data = get(workspaceAtom);
  const scoped = data.media.filter((asset) => asset.taskId === id);
  // 当前任务没有媒体时退回全局媒体列表，避免 demo 页面出现空白右栏。
  return scoped.length > 0 ? scoped : data.media;
});

const pickRandomIds = (ids: string[], count: number) => {
  const shuffled = ids
    .map((id) => ({ id, weight: Math.random() }))
    // ES2022 还没有 toSorted；这里 sort 的是 map 生成的新数组，不会修改原始 ids。
    // eslint-disable-next-line unicorn/no-array-sort
    .sort((left, right) => left.weight - right.weight)
    .map((item) => item.id);

  return shuffled.slice(0, count);
};

export const addUserMessageAtom = atom(null, (get, set, content: string) => {
  const taskId = get(currentTaskIdAtom);

  set(
    workspaceAtom,
    produce((draft) => {
      // 用户输入不是翻译文案，两个语言字段保存同一份原文，切换语言时仍然可见。
      draft.messages.push({
        id: crypto.randomUUID(),
        taskId,
        role: "user",
        content: {
          "zh-CN": content,
          "en-US": content,
        },
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }),
  );
});

export const createAssistantMessageAtom = atom(null, (get, set) => {
  const taskId = get(currentTaskIdAtom);
  const messageId = crypto.randomUUID();

  set(
    workspaceAtom,
    produce((draft) => {
      // assistant 的 mock stream 会逐段写入当前语言；显示层负责跨语言 fallback。
      draft.messages.push({
        id: messageId,
        taskId,
        role: "assistant",
        content: { "zh-CN": "", "en-US": "" },
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        streaming: true,
      });
    }),
  );

  return messageId;
});

export const appendAssistantChunkAtom = atom(
  null,
  (_get, set, payload: { messageId: string; locale: Locale; chunk: string }) => {
    set(
      workspaceAtom,
      produce((draft) => {
        const message = draft.messages.find((item) => item.id === payload.messageId);
        if (message) {
          // 保留真正的“逐段追加”过程，这里是流式体验的核心。
          message.content[payload.locale] += payload.chunk;
        }
      }),
    );
  },
);

export const finishAssistantMessageAtom = atom(null, (_get, set, messageId: string) => {
  set(
    workspaceAtom,
    produce((draft) => {
      const message = draft.messages.find((item) => item.id === messageId);
      if (message) {
        message.streaming = false;
      }
    }),
  );
});

export const createMediaPreviewMessageAtom = atom(null, (get, set, kind: MediaKind) => {
  const taskId = get(currentTaskIdAtom);
  const messageId = crypto.randomUUID();
  let selectedCount = 0;

  set(
    workspaceAtom,
    produce((draft) => {
      const candidates = draft.media.filter((asset) => asset.kind === kind && asset.src);
      const selectedIds = pickRandomIds(
        candidates.map((asset) => asset.id),
        kind === "image" ? 3 : 1,
      );
      selectedCount = selectedIds.length;

      // 媒体 mock 分支模拟“大文件加载”：先创建带骨架屏的消息，再逐个露出缩略图。
      draft.messages.push({
        id: messageId,
        taskId,
        role: "assistant",
        content: {
          "zh-CN":
            kind === "image"
              ? `正在从静态资源中挑选 ${selectedIds.length} 张图片...`
              : `正在从静态资源中准备 ${selectedIds.length} 个视频...`,
          "en-US":
            kind === "image"
              ? `Selecting ${selectedIds.length} images from static assets...`
              : `Preparing ${selectedIds.length} video from static assets...`,
        },
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        mediaAssetIds: selectedIds,
        mediaLoading: true,
        visibleMediaCount: 0,
      });

      draft.logs.push({
        id: crypto.randomUUID(),
        taskId,
        level: "success",
        content: {
          "zh-CN": kind === "image" ? "生成图片缩略图预览" : "生成视频缩略图预览",
          "en-US": kind === "image" ? "Generated image thumbnail previews" : "Generated video thumbnail preview",
        },
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });

      const task = draft.tasks.find((item) => item.id === taskId);
      if (task) {
        task.status = "completed";
        task.accent = "done";
        task.updatedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    }),
  );

  return { messageId, selectedCount };
});

export const revealMediaPreviewItemAtom = atom(null, (_get, set, messageId: string) => {
  set(
    workspaceAtom,
    produce((draft) => {
      const message = draft.messages.find((item) => item.id === messageId);
      if (message) {
        message.visibleMediaCount = Math.min(
          (message.visibleMediaCount ?? 0) + 1,
          message.mediaAssetIds?.length ?? 0,
        );
      }
    }),
  );
});

export const finishMediaPreviewMessageAtom = atom(null, (_get, set, messageId: string) => {
  set(
    workspaceAtom,
    produce((draft) => {
      const message = draft.messages.find((item) => item.id === messageId);
      if (message) {
        const selectedCount = message.mediaAssetIds?.length ?? 0;
        const firstAsset = draft.media.find((asset) => asset.id === message.mediaAssetIds?.[0]);
        message.mediaLoading = false;
        message.visibleMediaCount = selectedCount;
        message.content = {
          "zh-CN":
            firstAsset?.kind === "image"
              ? `已随机挑选 ${selectedCount} 张图片，点击缩略图可以查看大图。`
              : `已选择 ${selectedCount} 个视频，点击缩略图可以查看完整视频。`,
          "en-US":
            firstAsset?.kind === "image"
              ? `Selected ${selectedCount} random images. Click a thumbnail to view the full image.`
              : `Selected ${selectedCount} video. Click the thumbnail to view the full video.`,
        };
      }
    }),
  );
});

export const setTaskStatusAtom = atom(
  null,
  (get, set, payload: { taskId?: string; status: TaskStatus }) => {
    const taskId = payload.taskId ?? get(currentTaskIdAtom);
    set(
      workspaceAtom,
      produce((draft) => {
        const task = draft.tasks.find((item) => item.id === taskId);
        if (task) {
          // 任务状态和视觉强调保持同步，UI 不需要再推导 accent。
          task.status = payload.status;
          task.accent = payload.status === "completed" ? "done" : payload.status === "running" ? "active" : "neutral";
          task.updatedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
      }),
    );
  },
);

export const appendLogAtom = atom(null, (get, set, log: Pick<Message, "taskId"> & { text: string }) => {
  set(
    workspaceAtom,
    produce((draft) => {
      draft.logs.push({
        id: crypto.randomUUID(),
        taskId: log.taskId,
        level: "info",
        content: { "zh-CN": log.text, "en-US": log.text },
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    }),
  );
});
