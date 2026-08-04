import type { Locale, LocalizedText } from "./types";

// mock 流式内容只会生成当前语言；切换语言时用另一个非空字段兜底，避免已有对话“消失”。
export function getLocalizedText(text: LocalizedText, locale: Locale) {
  return text[locale] || text["zh-CN"] || text["en-US"];
}
