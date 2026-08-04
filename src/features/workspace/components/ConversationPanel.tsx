import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronLeft, ChevronRight, Play, Terminal, User, X } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { currentMessagesAtom, localeAtom, resumeMessageRequestAtom, workspaceAtom } from "../../../state/workspaceState";
import type { MediaAsset, MessageRole } from "../../../app/types";
import { getLocalizedText } from "../../../app/localized";

const icons: Record<MessageRole, typeof User> = {
  user: User,
  assistant: Bot,
  tool: Terminal,
};

export function ConversationPanel() {
  const { t } = useTranslation();
  const messages = useAtomValue(currentMessagesAtom);
  const workspace = useAtomValue(workspaceAtom);
  const locale = useAtomValue(localeAtom);
  const requestResumeMessage = useSetAtom(resumeMessageRequestAtom);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<{ assetIds: string[]; index: number } | null>(null);
  const mediaById = useMemo(
    () => new Map(workspace.media.map((asset) => [asset.id, asset])),
    [workspace.media],
  );
  const viewerAssets = useMemo(() => {
    if (!viewer) return [];
    return viewer.assetIds.map((id) => mediaById.get(id)).filter(Boolean) as MediaAsset[];
  }, [mediaById, viewer]);
  const activeAsset = viewer ? viewerAssets[viewer.index] : undefined;

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // 只滚动消息列表容器，避免 scrollIntoView 把整个页面推下去，导致输入框离开视口。
    // 这里依赖 messages 数组变化触发，所以用户消息和 assistant 流式 chunk 都会自动跟随到底部。
    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-5 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {messages.map((message) => {
          const Icon = icons[message.role];
          const isUser = message.role === "user";

          return (
            <article
              key={message.id}
              className={`message-enter flex gap-3 ${isUser ? "flex-row-reverse text-right" : ""}`}
            >
              <div className="grid size-8 shrink-0 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-700 dark:border-[#3F3F46] dark:bg-[#27272A] dark:text-zinc-200">
                <Icon size={16} />
              </div>
              <div
                className={`max-w-[82%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm ${
                  isUser
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-950"
                    : "border-zinc-200 bg-white text-zinc-800 dark:border-[#3F3F46] dark:bg-[#27272A] dark:text-zinc-100"
                }`}
              >
                <p>
                  {getLocalizedText(message.content, locale)}
                  {message.streaming ? <span className="stream-cursor" /> : null}
                </p>
                {message.cancelled ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex h-7 items-center rounded-md border border-zinc-200 bg-zinc-100 px-2.5 text-[11px] font-medium text-zinc-500 dark:border-[#52525B] dark:bg-[#3F3F46] dark:text-zinc-300">
                      {locale === "zh-CN" ? "已停止" : "Stopped"}
                    </span>
                    {message.role === "assistant" && !message.mediaAssetIds?.length ? (
                      <button
                        type="button"
                        onClick={() =>
                          requestResumeMessage({
                            messageId: message.id,
                            taskId: message.taskId,
                            locale,
                            requestId: crypto.randomUUID(),
                          })
                        }
                        className="interactive inline-flex h-7 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-[11px] font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-[#52525B] dark:bg-[#2F2F34] dark:text-zinc-100 dark:hover:bg-[#3A3A40]"
                      >
                        <Play size={11} />
                        {t("composer.resume")}
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {message.mediaAssetIds?.length ? (
                  <MediaThumbnailGrid
                    assets={message.mediaAssetIds.map((id) => mediaById.get(id)).filter(Boolean) as MediaAsset[]}
                    loading={Boolean(message.mediaLoading)}
                    visibleCount={message.visibleMediaCount ?? message.mediaAssetIds.length}
                    onOpen={(index) => setViewer({ assetIds: message.mediaAssetIds ?? [], index })}
                  />
                ) : null}
                <time className={`mt-2 block text-[11px] ${isUser ? "text-white/50 dark:text-zinc-950/50" : "text-zinc-400"}`}>
                  {message.createdAt}
                </time>
              </div>
            </article>
          );
        })}
      </div>
      {viewer && activeAsset && viewerAssets ? (
        <MediaViewer
          assets={viewerAssets}
          activeIndex={viewer.index}
          onClose={() => setViewer(null)}
          onMove={(nextIndex) => setViewer({ assetIds: viewer.assetIds, index: nextIndex })}
        />
      ) : null}
    </div>
  );
}

function MediaThumbnailGrid({
  assets,
  loading,
  visibleCount,
  onOpen,
}: {
  assets: MediaAsset[];
  loading: boolean;
  visibleCount: number;
  onOpen: (index: number) => void;
}) {
  const locale = useAtomValue(localeAtom);
  const visibleAssets = assets.slice(0, visibleCount);
  const skeletonCount = loading ? Math.max(assets.length - visibleAssets.length, 0) : 0;

  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {visibleAssets.map((asset, index) => (
        <button
          key={asset.id}
          type="button"
          onClick={() => onOpen(index)}
          className="interactive overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-left transition hover:border-zinc-300 dark:border-[#3F3F46] dark:bg-[#202024] dark:hover:border-[#52525B]"
        >
          {asset.kind === "image" ? (
            <img src={asset.src} alt={getLocalizedText(asset.title, locale)} className="aspect-video w-full object-cover" />
          ) : (
            <video src={asset.src} muted playsInline className="aspect-video w-full bg-black object-cover" />
          )}
          <div className="px-2 py-1.5">
            <p className="truncate text-[11px] font-medium">{getLocalizedText(asset.title, locale)}</p>
          </div>
        </button>
      ))}
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <div
          key={`media-skeleton-${index}`}
          className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-[#3F3F46] dark:bg-[#202024]"
        >
          <div className="media-skeleton aspect-video w-full" />
          <div className="space-y-1.5 px-2 py-2">
            <div className="media-skeleton h-2.5 w-2/3 rounded-full" />
            <div className="media-skeleton h-2 w-1/2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MediaViewer({
  assets,
  activeIndex,
  onClose,
  onMove,
}: {
  assets: MediaAsset[];
  activeIndex: number;
  onClose: () => void;
  onMove: (index: number) => void;
}) {
  const locale = useAtomValue(localeAtom);
  const asset = assets[activeIndex];
  const canStep = assets.length > 1;

  function move(offset: number) {
    onMove((activeIndex + offset + assets.length) % assets.length);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && canStep) move(-1);
      if (event.key === "ArrowRight" && canStep) move(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/80">
      {asset.kind === "image" ? (
        <img
          src={asset.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full scale-110 object-cover opacity-35 blur-3xl"
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgb(9_9_11/0.42)_46%,rgb(9_9_11/0.9)_100%)] backdrop-blur-xl" />
      <button type="button" aria-label="Close media viewer backdrop" className="absolute inset-0" onClick={onClose} />

      <section className="media-pop relative z-10 flex h-dvh w-full items-center justify-center px-5 py-20 sm:px-16 sm:py-16">
        <div className="absolute left-4 top-4 z-20 max-w-[min(70vw,520px)] rounded-2xl border border-white/12 bg-zinc-950/28 px-4 py-3 text-white shadow-[0_20px_70px_rgb(0_0_0/0.28)] backdrop-blur-2xl">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{getLocalizedText(asset.title, locale)}</h3>
          </div>
        </div>
        <ViewerButton label="Close media viewer" className="absolute right-4 top-4 z-20" onClick={onClose}>
          <X size={18} />
        </ViewerButton>

        {asset.kind === "image" ? (
          <img
            src={asset.src}
            alt={getLocalizedText(asset.title, locale)}
            className="max-h-full max-w-full rounded-xl object-contain shadow-[0_28px_120px_rgb(0_0_0/0.52)] ring-1 ring-white/10"
          />
        ) : (
          <video
            src={asset.src}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-xl bg-black/80 shadow-[0_28px_120px_rgb(0_0_0/0.52)] ring-1 ring-white/10"
          />
        )}

        {canStep ? (
          <>
            <ViewerButton label="Previous media" className="absolute bottom-4 left-4 sm:bottom-auto sm:left-6 sm:top-1/2 sm:-translate-y-1/2" onClick={() => move(-1)}>
              <ChevronLeft size={18} />
            </ViewerButton>
            <ViewerButton label="Next media" className="absolute bottom-4 right-4 sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2" onClick={() => move(1)}>
              <ChevronRight size={18} />
            </ViewerButton>
          </>
        ) : null}

        {canStep ? (
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/12 bg-zinc-950/28 px-3 py-2 shadow-xl backdrop-blur-2xl sm:bottom-4">
            {assets.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Open media ${index + 1}`}
                onClick={() => onMove(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ViewerButton({
  label,
  className = "",
  children,
  onClick,
}: {
  label: string;
  className?: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`interactive grid size-11 place-items-center rounded-full border border-white/12 bg-zinc-950/28 text-white shadow-xl backdrop-blur-2xl transition hover:bg-white/15 ${className}`}
    >
      {children}
    </button>
  );
}
