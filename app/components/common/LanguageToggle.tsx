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
}: {
  lang: Locale;
  preserved: URLSearchParams;
  pathname?: string;
}) {
  return (
    <details className="relative">
      <summary className="flex items-center gap-2 px-3 py-2 rounded-full border border-haiti-ink/15 bg-white/80 text-sm font-semibold text-haiti-ink cursor-pointer select-none shadow-sm hover:border-haiti-ink/40">
        <span>{LANGUAGE_LABELS[lang]}</span>
        <span className="text-[10px] text-haiti-ink/70">▾</span>
      </summary>
      <div className="absolute right-0 mt-2 w-44 rounded-xl border border-haiti-ink/10 bg-white shadow-card overflow-hidden z-20">
        {LOCALES.map((loc) => {
          const active = loc === lang;
          return (
            <a
              key={loc}
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
