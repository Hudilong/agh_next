'use client';

import { useEffect, useState } from "react";

import { StatusMessage } from "@/app/components/common/StatusMessage";
import { msg, type Locale } from "@/app/i18n";
import type { TreeCopy } from "@/app/tree/GenealogyExplorer";

type MobileControlsSheetProps = {
  lang: Locale;
  copy: TreeCopy;
  query: string;
  setQuery: (value: string) => void;
  availableLetters: string[];
  letterFilter: string;
  setLetterFilter: (value: string) => void;
  direction: "asc" | "desc";
  setDirection: (dir: "asc" | "desc") => void;
  maxDepth: number;
  setMaxDepth: (value: number) => void;
  people?: Array<{
    id: string;
    name: string;
    birth?: string;
    death?: string;
    familyName?: string;
  }>;
  focusId: string;
  setFocusId: (id: string) => void;
  loading: boolean;
};

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

export function MobileControlsSheet({
  lang,
  copy,
  query,
  setQuery,
  availableLetters,
  letterFilter,
  setLetterFilter,
  direction,
  setDirection,
  maxDepth,
  setMaxDepth,
  people,
  focusId,
  setFocusId,
  loading,
}: MobileControlsSheetProps) {
  const [open, setOpen] = useState(false);
  const safePeople = Array.isArray(people) ? people : [];
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between rounded-2xl border border-haiti-ink/15 bg-white/90 px-4 py-3 text-sm font-semibold text-haiti-navy shadow-card"
          aria-expanded={open}
          aria-controls="tree-mobile-controls"
        >
          <span>{copy.quickSearch}</span>
          <span className="text-xs text-haiti-ink/70">▾</span>
        </button>
      </div>

      {open && (
        <div
          id="tree-mobile-controls"
          className="fixed inset-0 z-50 bg-white"
          role="dialog"
          aria-modal="true"
          aria-label={copy.quickSearch}
        >
          <div className="flex flex-col h-full pt-6 pb-8 px-4 overflow-y-auto">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-haiti-ink/10">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-haiti-ink/60">
                  {copy.tipsTitle}
                </div>
                <div className="text-base font-semibold text-haiti-navy">
                  {copy.quickSearch}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-haiti-ink/15 px-4 py-2 text-xs font-semibold text-haiti-ink hover:border-haiti-ink/40"
              >
                {msg(lang, "close")}
              </button>
            </div>

            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-haiti-navy">
                  {copy.quickSearch}
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-haiti-coral focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-haiti-navy">
                  {copy.letterJump}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLetterFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                      letterFilter === 'all'
                        ? 'border-haiti-coral bg-haiti-coral text-white shadow-sm'
                        : 'border-white/60 bg-white/70 text-haiti-ink/80 hover:border-haiti-coral/60'
                    }`}
                  >
                    {copy.allLabel}
                  </button>
                  {availableLetters.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLetterFilter(l)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        letterFilter === l
                          ? 'border-haiti-coral bg-haiti-coral text-white shadow-sm'
                          : 'border-white/60 bg-white/70 text-haiti-ink/80 hover:border-haiti-coral/60'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/70 p-3 space-y-3 text-sm text-haiti-ink/80">
                <div className="font-semibold text-haiti-navy text-sm">
                  {copy.tipsTitle}
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex rounded-full bg-white/70 border border-white/60">
                    <button
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                        direction === 'asc'
                          ? 'bg-haiti-coral text-white shadow-sm'
                          : 'text-haiti-ink/80 hover:text-haiti-ink'
                      }`}
                      onClick={() => setDirection('asc')}
                    >
                      {copy.ascendancy}
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                        direction === 'desc'
                          ? 'bg-haiti-coral text-white shadow-sm'
                          : 'text-haiti-ink/80 hover:text-haiti-ink'
                      }`}
                      onClick={() => setDirection('desc')}
                    >
                      {copy.descendancy}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs uppercase tracking-[0.1em] text-haiti-ink/60">
                      {copy.depth}
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      step={1}
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                      className="w-32 accent-haiti-coral"
                    />
                    <span className="text-sm font-semibold text-haiti-navy">{maxDepth}</span>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {copy.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-haiti-navy">
                  {copy.peopleLabel}
                </div>
                <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                  {safePeople.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setFocusId(p.id);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                        focusId === p.id
                          ? "border-haiti-coral bg-white shadow-sm"
                          : "border-white/60 bg-white/60 hover:border-haiti-coral/60"
                      }`}
                      disabled={loading}
                    >
                      <div className="text-sm font-semibold text-haiti-navy">{p.name}</div>
                      <div className="text-[11px] text-haiti-ink/70">
                        {(p.birth ?? "…") + " – " + (p.death ?? "…")}
                      </div>
                    </button>
                  ))}
                  {safePeople.length === 0 && (
                    <StatusMessage className="text-xs">
                      {copy.noResults}
                    </StatusMessage>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
