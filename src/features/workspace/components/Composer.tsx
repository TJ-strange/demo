import { useState } from "react";
import { Send, Square } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  addUserMessageAtom,
  appendAssistantChunkAtom,
  appendLogAtom,
  createAssistantMessageAtom,
  createMediaPreviewMessageAtom,
  currentTaskAtom,
  currentTaskIdAtom,
  finishMediaPreviewMessageAtom,
  finishAssistantMessageAtom,
  isGeneratingAtom,
  localeAtom,
  revealMediaPreviewItemAtom,
  setTaskStatusAtom,
} from "../../../state/workspaceState";
import { mockAssistantStream } from "../../../app/streaming";
import type { MediaKind } from "../../../app/types";

function getRequestedMediaKind(text: string): MediaKind | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("图片") || normalized.includes("image")) return "image";
  if (normalized.includes("视频") || normalized.includes("video")) return "video";
  return null;
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function Composer() {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const isGenerating = useAtomValue(isGeneratingAtom);
  const locale = useAtomValue(localeAtom);
  const taskId = useAtomValue(currentTaskIdAtom);
  const currentTask = useAtomValue(currentTaskAtom);
  const setGenerating = useSetAtom(isGeneratingAtom);
  const addUserMessage = useSetAtom(addUserMessageAtom);
  const createMediaPreviewMessage = useSetAtom(createMediaPreviewMessageAtom);
  const revealMediaPreviewItem = useSetAtom(revealMediaPreviewItemAtom);
  const finishMediaPreviewMessage = useSetAtom(finishMediaPreviewMessageAtom);
  const createAssistantMessage = useSetAtom(createAssistantMessageAtom);
  const appendChunk = useSetAtom(appendAssistantChunkAtom);
  const finishMessage = useSetAtom(finishAssistantMessageAtom);
  const setTaskStatus = useSetAtom(setTaskStatusAtom);
  const appendLog = useSetAtom(appendLogAtom);
  const isMediaTask = currentTask.id === "task-media";
  const placeholder = isMediaTask ? t("composer.mediaPlaceholder") : t("composer.placeholder");

  async function handleSubmit() {
    const text = value.trim();
    if (!text || isGenerating) return;

    // 先清空输入再写入消息，用户会立即看到“已发送”的反馈。
    setValue("");
    addUserMessage(text);

    const mediaKind = isMediaTask ? getRequestedMediaKind(text) : null;
    if (mediaKind) {
      setGenerating(true);
      setTaskStatus({ status: "running" });
      appendLog({ taskId, text: locale === "zh-CN" ? "开始加载媒体缩略图" : "Started loading media thumbnails" });

      const { messageId, selectedCount } = createMediaPreviewMessage(mediaKind);
      for (let index = 0; index < selectedCount; index += 1) {
        // 大图/视频资源通常比较重，这里用延迟和骨架屏模拟网络与解码时间。
        // eslint-disable-next-line no-await-in-loop
        await delay(520 + Math.random() * 360);
        revealMediaPreviewItem(messageId);
      }
      await delay(260);
      finishMediaPreviewMessage(messageId);
      setTaskStatus({ status: "completed" });
      setGenerating(false);
      return;
    }

    setGenerating(true);
    setTaskStatus({ status: "running" });
    appendLog({ taskId, text: locale === "zh-CN" ? "开始 mock 流式传输" : "Started mock streaming" });

    const assistantId = createAssistantMessage();

    try {
      // mockAssistantStream 是一个 async generator，用 for await 模拟真实 SSE/流式接口。
      for await (const chunk of mockAssistantStream(locale)) {
        appendChunk({ messageId: assistantId, locale, chunk });
      }
      finishMessage(assistantId);
      setTaskStatus({ status: "completed" });
      appendLog({ taskId, text: locale === "zh-CN" ? "流式传输完成" : "Streaming completed" });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="shrink-0 border-t border-zinc-200 bg-zinc-50/95 p-3 backdrop-blur-xl dark:border-[#3F3F46] dark:bg-[#202024]/95 sm:p-5">
      <div className="mx-auto max-w-3xl">
        <div className="originkit-focus flex items-end gap-3 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-[#3F3F46] dark:bg-[#27272A]">
          <textarea
            value={value}
            rows={1}
            disabled={isGenerating}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder={placeholder}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-zinc-400 focus-visible:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="button"
            disabled={!value.trim() || isGenerating}
            onClick={() => void handleSubmit()}
            className="interactive inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-950"
          >
            {isGenerating ? <Square size={15} /> : <Send size={15} />}
            <span className="hidden sm:inline">{isGenerating ? t("composer.generating") : t("composer.send")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
