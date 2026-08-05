import type { ReactNode } from "react";
import { Image, MonitorPlay, Settings, Terminal } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import {
  activeContextTabAtom,
  currentLogsAtom,
  localeAtom,
  selectedAssetAtom,
  selectedAssetIdAtom,
  taskMediaAtom,
  themeAtom,
} from "../../../state/workspaceState";
import type { ContextTab } from "../../../app/types";
import { getLocalizedText } from "../../../app/localized";
import { PanelTitle } from "./ui";

const tabs: Array<{ id: ContextTab; icon: typeof Terminal }> = [
  { id: "logs", icon: Terminal },
  { id: "media", icon: Image },
  { id: "settings", icon: Settings },
];

export function ContextPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useAtom(activeContextTabAtom);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-[#3F3F46]">
        <PanelTitle>Context</PanelTitle>
        <div className="mt-3 grid grid-cols-3 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-[#3F3F46] dark:bg-[#18181B]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`interactive flex h-9 items-center justify-center gap-1 rounded-md text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-[#27272A] dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon size={14} />
                <span className="hidden xl:inline">{t(`tabs.${tab.id}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTab === "logs" ? <LogsPanel /> : null}
        {activeTab === "media" ? <MediaPanel /> : null}
        {activeTab === "settings" ? <SettingsPanel /> : null}
      </div>
    </div>
  );
}

function LogsPanel() {
  const logs = useAtomValue(currentLogsAtom);
  const locale = useAtomValue(localeAtom);

  return (
    <div className="context-enter space-y-3">
      {logs.map((log) => (
        <article key={log.id} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-[#3F3F46] dark:bg-[#27272A]">
          <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="uppercase">{log.level}</span>
            <time>{log.time}</time>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-200">{getLocalizedText(log.content, locale)}</p>
        </article>
      ))}
    </div>
  );
}

function MediaPanel() {
  const media = useAtomValue(taskMediaAtom);
  const locale = useAtomValue(localeAtom);
  const [selectedAssetId, setSelectedAssetId] = useAtom(selectedAssetIdAtom);
  const selected = useAtomValue(selectedAssetAtom);
  const { t } = useTranslation();

  return (
    <div className="context-enter space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {media.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => setSelectedAssetId(asset.id)}
            className={`interactive rounded-lg border p-3 text-left transition ${
              selectedAssetId === asset.id
                ? "border-zinc-950 bg-zinc-950 dark:border-zinc-200 dark:bg-zinc-100"
                : "border-zinc-200 bg-white dark:border-[#3F3F46] dark:bg-[#27272A]"
            }`}
          >
            <div className="mb-3 grid aspect-video place-items-center rounded-md bg-zinc-100 dark:bg-[#202024]">
              {asset.kind === "video" ? <MonitorPlay size={22} /> : <Image size={22} />}
            </div>
            <p className={`truncate text-xs font-medium ${selectedAssetId === asset.id ? "text-white dark:text-zinc-950" : ""}`}>{getLocalizedText(asset.title, locale)}</p>
          </button>
        ))}
      </div>

      {selected ? (
        <article className="media-pop rounded-lg border border-zinc-200 bg-white p-3 dark:border-[#3F3F46] dark:bg-[#27272A]">
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-[#3F3F46] dark:bg-[#18181B]">
            {selected.src && selected.kind === "image" ? (
              <img src={selected.src} alt={getLocalizedText(selected.title, locale)} className="aspect-video w-full object-cover" />
            ) : null}
            {selected.src && selected.kind === "video" ? (
              <video src={selected.src} controls className="aspect-video w-full bg-black" />
            ) : null}
            {!selected.src ? (
              <div className="grid aspect-video place-items-center text-center text-sm text-zinc-500">
                <div>
                  <p>{t("media.empty")}</p>
                  <p className="mt-1 text-xs">
                    {selected.kind === "image" ? t("media.imageHint") : t("media.videoHint")}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <h3 className="mt-3 text-sm font-semibold">{getLocalizedText(selected.title, locale)}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{getLocalizedText(selected.description, locale)}</p>
        </article>
      ) : null}
    </div>
  );
}

function SettingsPanel() {
  const { i18n, t } = useTranslation();
  const [locale, setLocale] = useAtom(localeAtom);
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <div className="context-enter space-y-5">
      <div>
        <h3 className="text-sm font-semibold">{t("settings.title")}</h3>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{t("settings.motionHint")}</p>
      </div>

      <SettingRow label={t("settings.language")}>
        <SegmentedControl
          value={locale}
          options={[
            { label: "中文", value: "zh-CN" },
            { label: "EN", value: "en-US" },
          ]}
          onChange={(value) => {
            const next = value as "zh-CN" | "en-US";
            setLocale(next);
            void i18n.changeLanguage(next);
          }}
        />
      </SettingRow>

      <SettingRow label={t("settings.theme")}>
        <SegmentedControl
          value={theme}
          options={[
            { label: t("settings.light"), value: "light" },
            { label: t("settings.dark"), value: "dark" },
          ]}
          onChange={(value) => setTheme(value as "light" | "dark")}
        />
      </SettingRow>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-[#3F3F46] dark:bg-[#27272A]">
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{label}</span>
      {children}
    </div>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex rounded-md border border-zinc-200 bg-zinc-100 p-1 dark:border-[#3F3F46] dark:bg-[#18181B]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`h-7 rounded px-3 text-xs font-medium transition ${
            value === option.value
              ? "bg-white text-zinc-950 shadow-sm dark:bg-[#27272A] dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
