import type { Locale, LocalizedText } from "@/types/content";

export function t(text: LocalizedText | undefined, locale: Locale): string {
  if (!text) return "";
  const primary = text[locale]?.trim();
  if (primary) return primary;
  const fallback = locale === "en" ? text.ru?.trim() : text.en?.trim();
  return fallback || "";
}

export function hasTranslation(text: LocalizedText, locale: Locale): boolean {
  return Boolean(text[locale]?.trim());
}
