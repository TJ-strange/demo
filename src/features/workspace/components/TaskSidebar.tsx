import { Link } from "wouter";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { currentTaskIdAtom, localeAtom, workspaceAtom } from "../../../state/workspaceState";
import type { TaskStatus } from "../../../app/types";
import { getLocalizedText } from "../../../app/localized";
import { PanelTitle } from "./ui";

const statusClasses: Record<TaskStatus, string> = {
  queued: "bg-zinc-200 text-zinc-600 dark:bg-[#3F3F46] dark:text-zinc-300",
  running: "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950",
  completed: "bg-zinc-100 text-zinc-500 dark:bg-[#27272A] dark:text-zinc-400",
};

export function TaskSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const data = useAtomValue(workspaceAtom);
  const activeId = useAtomValue(currentTaskIdAtom);
  const locale = useAtomValue(localeAtom);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-[#3F3F46]">
        <div>
          <div>
            <p className="text-xl font-semibold leading-none">DEMO</p>
            <p className="mt-1 text-xs text-zinc-500">{t("app.tagline")}</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <PanelTitle>{t("nav.tasks")}</PanelTitle>
        <div className="mt-4 space-y-3">
          {data.tasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`} onClick={onNavigate} className="block">
              <article
                className={`originkit-card group cursor-pointer rounded-lg border p-3.5 transition duration-300 ${
                  task.id === activeId
                    ? "border-zinc-300 bg-zinc-100 text-zinc-950 shadow-sm dark:border-[#52525B] dark:bg-[#27272A] dark:text-zinc-50"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:border-[#3F3F46] dark:bg-[#202024] dark:text-zinc-200 dark:hover:border-[#52525B] dark:hover:bg-[#27272A]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-sm font-medium">{getLocalizedText(task.title, locale)}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      task.id === activeId ? "bg-white text-zinc-700 ring-1 ring-zinc-200 dark:bg-[#202024] dark:text-zinc-200 dark:ring-[#3F3F46]" : statusClasses[task.status]
                    }`}
                  >
                    {t(`status.${task.status}`)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {getLocalizedText(task.summary, locale)}
                </p>
                <p className="mt-3 text-[11px] text-zinc-400">
                  {task.updatedAt}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
