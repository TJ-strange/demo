import { useEffect, useRef, useState } from "react";
import { Send, Square } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  addUserMessageAtom,
  appendAssistantChunkAtom,
  appendLogAtom,
  cancelAssistantMessageAtom,
  cancelMediaPreviewMessageAtom,
  createAssistantMessageAtom,
  createMediaPreviewMessageAtom,
  currentTaskAtom,
  currentTaskIdAtom,
  finishMediaPreviewMessageAtom,
  finishAssistantMessageAtom,
  isGeneratingAtom,
  localeAtom,
  revealMediaPreviewItemAtom,
  resumeAssistantMessageAtom,
  resumeMessageRequestAtom,
  setTaskStatusAtom,
} from "../../../state/workspaceState";
import { createMockStreamPlan, delay, isAbortError, streamMockPlan } from "../../../app/streaming";
import type { MockStreamPlan } from "../../../app/streaming";
import type { Locale, MediaKind } from "../../../app/types";

interface PromptQueueItem {
  type: "prompt";
  text: string;
  taskId: string;
  locale: Locale;
  mediaKind: MediaKind | null;
}

interface ResumeQueueItem {
  type: "resume";
  messageId: string;
  taskId: string;
  locale: Locale;
}

type QueueItem = PromptQueueItem | ResumeQueueItem;

interface ResumeSession {
  taskId: string;
  locale: Locale;
  plan: MockStreamPlan;
  nextIndex: number;
}

function getRequestedMediaKind(text: string): MediaKind | null {
  const normalized = text.toLowerCase();
  if (normalized.includes("图片") || normalized.includes("image")) return "image";
  if (normalized.includes("视频") || normalized.includes("video")) return "video";
  return null;
}

export function Composer() {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [queuedCount, setQueuedCount] = useState(0);
  const queueRef = useRef<QueueItem[]>([]);
  const resumeSessionsRef = useRef<Record<string, ResumeSession>>({});
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
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
  const cancelAssistantMessage = useSetAtom(cancelAssistantMessageAtom);
  const cancelMediaPreviewMessage = useSetAtom(cancelMediaPreviewMessageAtom);
  const resumeAssistantMessage = useSetAtom(resumeAssistantMessageAtom);
  const resumeRequest = useAtomValue(resumeMessageRequestAtom);
  const setTaskStatus = useSetAtom(setTaskStatusAtom);
  const appendLog = useSetAtom(appendLogAtom);
  const isMediaTask = currentTask.id === "task-media";
  const placeholder = isMediaTask ? t("composer.mediaPlaceholder") : t("composer.placeholder");

  function syncQueuedCount() {
    setQueuedCount(queueRef.current.length);
  }

  useEffect(() => {
    if (!resumeRequest) return;

    const session = resumeSessionsRef.current[resumeRequest.messageId];
    if (!session || session.nextIndex >= session.plan.segments.length) return;
    if (queueRef.current.some((item) => item.type === "resume" && item.messageId === resumeRequest.messageId)) return;

    queueRef.current.push({
      type: "resume",
      messageId: resumeRequest.messageId,
      taskId: resumeRequest.taskId,
      locale: resumeRequest.locale,
    });
    syncQueuedCount();
    void processQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestId is an event-like trigger from another component.
  }, [resumeRequest?.requestId]);

  async function runMediaPreview(item: PromptQueueItem, signal: AbortSignal) {
    if (!item.mediaKind) return;

    setTaskStatus({ taskId: item.taskId, status: "running" });
    appendLog({
      taskId: item.taskId,
      text: item.locale === "zh-CN" ? "开始加载媒体缩略图" : "Started loading media thumbnails",
    });

    const { messageId, selectedCount } = createMediaPreviewMessage({ kind: item.mediaKind, taskId: item.taskId });

    try {
      for (let index = 0; index < selectedCount; index += 1) {
        // 大图/视频资源通常比较重，这里用延迟和骨架屏模拟网络与解码时间。
        // eslint-disable-next-line no-await-in-loop -- preview items should appear one by one.
        await delay(520 + Math.random() * 360, signal);
        revealMediaPreviewItem(messageId);
      }
      await delay(260, signal);
      finishMediaPreviewMessage(messageId);
      setTaskStatus({ taskId: item.taskId, status: "completed" });
    } catch (error) {
      if (!isAbortError(error)) throw error;
      cancelMediaPreviewMessage(messageId);
      setTaskStatus({ taskId: item.taskId, status: "completed" });
      appendLog({ taskId: item.taskId, text: item.locale === "zh-CN" ? "已停止加载媒体预览" : "Stopped loading media previews" });
    }
  }

  async function runAssistantStream(item: PromptQueueItem, signal: AbortSignal) {
    setTaskStatus({ taskId: item.taskId, status: "running" });
    appendLog({
      taskId: item.taskId,
      text: item.locale === "zh-CN" ? "开始 mock 流式传输" : "Started mock streaming",
    });

    const assistantId = createAssistantMessage({ taskId: item.taskId });
    const session: ResumeSession = {
      taskId: item.taskId,
      locale: item.locale,
      plan: createMockStreamPlan(item.locale),
      nextIndex: 0,
    };
    resumeSessionsRef.current[assistantId] = session;

    try {
      // mockAssistantStream 是一个 async generator，用 for await 模拟真实 SSE/流式接口。
      for await (const streamItem of streamMockPlan(session.plan, session.nextIndex, signal)) {
        appendChunk({ messageId: assistantId, locale: session.locale, chunk: streamItem.chunk });
        session.nextIndex = streamItem.nextIndex;
      }
      finishMessage(assistantId);
      delete resumeSessionsRef.current[assistantId];
      setTaskStatus({ taskId: item.taskId, status: "completed" });
      appendLog({ taskId: item.taskId, text: item.locale === "zh-CN" ? "流式传输完成" : "Streaming completed" });
    } catch (error) {
      if (!isAbortError(error)) throw error;
      cancelAssistantMessage(assistantId);
      setTaskStatus({ taskId: item.taskId, status: "completed" });
      appendLog({ taskId: item.taskId, text: item.locale === "zh-CN" ? "已停止当前流式传输" : "Stopped current stream" });
    }
  }

  async function runResumeStream(item: ResumeQueueItem, signal: AbortSignal) {
    const session = resumeSessionsRef.current[item.messageId];
    if (!session || session.nextIndex >= session.plan.segments.length) return;

    setTaskStatus({ taskId: session.taskId, status: "running" });
    resumeAssistantMessage(item.messageId);
    appendLog({
      taskId: session.taskId,
      text: item.locale === "zh-CN" ? "继续写入已停止的流式回复" : "Resumed the stopped stream",
    });

    try {
      // 继续时不创建新消息，而是从保存的 chunk 下标继续写入同一条 assistant message。
      for await (const streamItem of streamMockPlan(session.plan, session.nextIndex, signal)) {
        appendChunk({ messageId: item.messageId, locale: session.locale, chunk: streamItem.chunk });
        session.nextIndex = streamItem.nextIndex;
      }
      finishMessage(item.messageId);
      delete resumeSessionsRef.current[item.messageId];
      setTaskStatus({ taskId: session.taskId, status: "completed" });
      appendLog({ taskId: session.taskId, text: item.locale === "zh-CN" ? "流式传输完成" : "Streaming completed" });
    } catch (error) {
      if (!isAbortError(error)) throw error;
      cancelAssistantMessage(item.messageId);
      setTaskStatus({ taskId: session.taskId, status: "completed" });
      appendLog({ taskId: session.taskId, text: item.locale === "zh-CN" ? "已再次停止当前流式传输" : "Stopped current stream again" });
    }
  }

  async function processQueue() {
    if (processingRef.current) return;

    processingRef.current = true;
    setGenerating(true);

    try {
      while (queueRef.current.length > 0) {
        const item = queueRef.current.shift();
        syncQueuedCount();
        if (!item) continue;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (item.type === "resume") {
          // “继续”也进入同一条队列，避免和当前正在流式写入的消息并发抢状态。
          // eslint-disable-next-line no-await-in-loop -- queued operations must be processed sequentially.
          await runResumeStream(item, controller.signal);
        } else if (item.mediaKind) {
          // 排队中的输入只保存在内存队列里，真正开始处理时才进入对话流。
          // 这样用户能看到“排队中”，但不会误以为后续消息已经开始执行。
          addUserMessage({ content: item.text, taskId: item.taskId });
          // 媒体预览和文本回复共用一个 FIFO 队列，用户连续输入时会按提交顺序执行。
          // eslint-disable-next-line no-await-in-loop -- queued user prompts must be processed sequentially.
          await runMediaPreview(item, controller.signal);
        } else {
          addUserMessage({ content: item.text, taskId: item.taskId });
          // eslint-disable-next-line no-await-in-loop -- queued user prompts must be processed sequentially.
          await runAssistantStream(item, controller.signal);
        }

        abortControllerRef.current = null;
      }
    } finally {
      abortControllerRef.current = null;
      processingRef.current = false;
      setGenerating(false);
      syncQueuedCount();
    }
  }

  function handleSubmit() {
    const text = value.trim();
    if (!text) return;

    // 先清空输入并进入队列；是否展示到对话流，由 processQueue 按顺序控制。
    setValue("");
    queueRef.current.push({
      type: "prompt",
      text,
      taskId,
      locale,
      mediaKind: isMediaTask ? getRequestedMediaKind(text) : null,
    });
    syncQueuedCount();
    void processQueue();
  }

  function handleStop() {
    abortControllerRef.current?.abort();
  }

  return (
    <div className="shrink-0 border-t border-zinc-200 bg-zinc-50/95 p-3 backdrop-blur-xl dark:border-[#3F3F46] dark:bg-[#202024]/95 sm:p-5">
      <div className="mx-auto max-w-3xl">
        <div className="originkit-focus flex items-end gap-3 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-[#3F3F46] dark:bg-[#27272A]">
          <textarea
            value={value}
            rows={1}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={placeholder}
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-zinc-400 focus-visible:outline-none"
          />
          {queuedCount > 0 ? (
            <span className="hidden shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-[#3F3F46] dark:text-zinc-300 sm:inline">
              {t("composer.queued", { count: queuedCount })}
            </span>
          ) : null}
          {isGenerating ? (
            <button
              type="button"
              onClick={handleStop}
              className="interactive inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-[#52525B] dark:bg-[#2F2F34] dark:text-zinc-100 dark:hover:bg-[#3A3A40]"
            >
              <Square size={15} />
              <span className="hidden sm:inline">{t("composer.stop")}</span>
            </button>
          ) : null}
          <button
            type="button"
            disabled={!value.trim()}
            onClick={handleSubmit}
            className="interactive inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-950"
          >
            <Send size={15} />
            <span className="hidden sm:inline">{t("composer.send")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
