import { PanelLeft, PanelRight, Sparkles } from "lucide-react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { currentTaskAtom, isGeneratingAtom, localeAtom } from "../../../state/workspaceState";
import { getLocalizedText } from "../../../app/localized";
import { IconButton } from "./ui";

interface WorkspaceHeaderProps {
  onOpenTasks: () => void;
  onOpenContext: () => void;
}

export function WorkspaceHeader({ onOpenTasks, onOpenContext }: WorkspaceHeaderProps) {
  const { t } = useTranslation();
  const task = useAtomValue(currentTaskAtom);
  const locale = useAtomValue(localeAtom);
  const isGenerating = useAtomValue(isGeneratingAtom);

  return (
    <header className="flex h-15 items-center justify-between border-b border-zinc-200 bg-zinc-50/90 px-3 backdrop-blur-xl dark:border-[#3F3F46] dark:bg-[#202024]/90 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton label="Open tasks" className="lg:hidden" onClick={onOpenTasks}>
          <PanelLeft size={18} />
        </IconButton>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-[#3F3F46] dark:bg-[#27272A]">
          <Sparkles size={17} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{getLocalizedText(task.title, locale)}</p>
          <p className="truncate text-xs text-zinc-500">{t("app.project")}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-[#3F3F46] dark:text-zinc-300 sm:flex">
          <span className={isGenerating ? "status-dot animate-pulse" : "status-dot"} />
          {isGenerating ? t("app.running") : t("app.idle")}
        </span>
        <IconButton label="Open context" className="lg:hidden" onClick={onOpenContext}>
          <PanelRight size={18} />
        </IconButton>
      </div>
    </header>
  );
}
