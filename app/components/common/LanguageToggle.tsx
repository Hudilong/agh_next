import type { Locale } from "@/app/i18n";
import { LOCALES } from "@/app/i18n";
import { buildPreservedForLink } from "@/lib/page-params";

const LANGUAGE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  ht: "Kreyòl",
};

export function LanguageToggle({
  lang,
  preserved,
  pathname = "/",
  inline = false,
}: {
  lang: Locale;
  preserved: URLSearchParams;
  pathname?: string;
  inline?: boolean;
}) {
  return (
    <details className={`relative ${inline ? "w-full" : ""}`}>
      <summary className={`flex items-center gap-2 px-3 py-2 rounded-full border border-haiti-ink/15 bg-white/80 text-sm font-semibold text-haiti-ink cursor-pointer select-none shadow-sm hover:border-haiti-ink/40 ${inline ? "w-full justify-between" : ""}`}>
        <span className="truncate">{LANGUAGE_LABELS[lang]}</span>
        <span className="text-[10px] text-haiti-ink/70 ml-auto">▾</span>
      </summary>
      <div className="absolute right-0 mt-2 w-44 rounded-xl border border-haiti-ink/10 bg-white shadow-card overflow-hidden z-50">
        {LOCALES.map((loc) => {
          const active = loc === lang;
          return (
            <a
              key={loc}
              aria-label={loc.toUpperCase()}
              href={buildPreservedForLink(pathname, preserved, { lang: loc })}
              className={`block px-4 py-2 text-sm transition ${
                active
                  ? "bg-haiti-navy text-white font-semibold"
                  : "text-haiti-ink hover:bg-haiti-foam/60"
              }`}
            >
              {LANGUAGE_LABELS[loc]}
            </a>
          );
        })}
      </div>
    </details>
  );
}
