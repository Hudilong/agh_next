import type { Locale } from "@/app/i18n";

export type LocalizedCopy<T> = Record<Locale, T>;

export function selectCopy<T>(copy: LocalizedCopy<T>, lang: Locale): T {
  return copy[lang] ?? copy.fr;
}
