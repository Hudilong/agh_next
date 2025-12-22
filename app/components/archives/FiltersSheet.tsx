'use client';

import { useEffect, useMemo, useState } from "react";

import { FiltersForm } from "./FiltersForm";
import { msg, type Locale } from "@/app/i18n";
import type { Lookups, SearchParams } from "@/lib/search";

const FILTER_KEYS: Array<keyof SearchParams> = [
  "nom",
  "prenom",
  "typeacte",
  "role",
  "dtmin",
  "dtmax",
  "notes",
  "ville",
  "pays",
  "comacte",
];

function countActiveFilters(params: SearchParams) {
  return FILTER_KEYS.reduce((count, key) => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw ?? "";
    return value && value.length > 0 ? count + 1 : count;
  }, 0);
}

function useLockBodyScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}

export function FiltersSheet({
  lang,
  params,
  lookups,
}: {
  lang: Locale;
  params: SearchParams;
  lookups: Lookups;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = useMemo(() => countActiveFilters(params), [params]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useLockBodyScroll(open);

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between rounded-2xl border border-haiti-ink/15 bg-white/90 px-4 py-3 text-sm font-semibold text-haiti-navy shadow-card"
          aria-expanded={open}
          aria-controls="mobile-filters-sheet"
        >
          <span>{msg(lang, "filtersTitle")}</span>
          <span className="inline-flex items-center gap-2 text-xs text-haiti-ink/70">
            {activeCount > 0 && (
              <span className="rounded-full bg-haiti-coral text-white px-2 py-[2px] text-[11px] font-semibold">
                {activeCount}
              </span>
            )}
          </span>
        </button>

        {open && (
          <div
            id="mobile-filters-sheet"
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={msg(lang, "filtersTitle")}
          >
            <div
              className="absolute inset-0"
              role="presentation"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 bg-white rounded-t-3xl shadow-card border border-haiti-ink/10 p-4 pt-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-haiti-ink/10">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-haiti-ink/60">
                    {msg(lang, "navSearch")}
                  </div>
                  <div className="text-base font-semibold text-haiti-navy">
                    {msg(lang, "filtersTitle")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-haiti-ink/15 px-3 py-1.5 text-xs font-semibold text-haiti-ink hover:border-haiti-ink/40"
                >
                  {msg(lang, "close")}
                </button>
              </div>
              <div className="pt-4">
                <FiltersForm lang={lang} params={params} lookups={lookups} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <FiltersForm lang={lang} params={params} lookups={lookups} />
      </div>
    </>
  );
}
