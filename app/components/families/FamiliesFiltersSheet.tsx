'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Chip } from "@/app/components/common/Chip";
import { msg, type Locale } from "@/app/i18n";
import { buildPathWithParams } from "@/lib/page-params";

type FamiliesFiltersSheetProps = {
  lang: Locale;
  letter: string;
  query: string;
  allLabel: string;
  letterJumpLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  families: { nom: string | null; _count: { _all: number } }[];
  selectedFamily: string;
  familiesLabel: string;
  noFamilies: string;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

export function FamiliesFiltersSheet({
  lang,
  letter,
  query,
  allLabel,
  letterJumpLabel,
  searchLabel,
  searchPlaceholder,
  families,
  selectedFamily,
  familiesLabel,
  noFamilies,
}: FamiliesFiltersSheetProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentQ = searchParams.get("q") ?? query ?? "";
  const initialOpen = searchParams.get("filters") === "open";
  const [open, setOpen] = useState(initialOpen);

  const preserved = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filters");
    return params;
  }, [searchParams]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useLockBodyScroll(open);

  const navigate = ({
    nextLetter,
    nextQuery,
    family,
    keepOpen,
  }: {
    nextLetter?: string;
    nextQuery?: string;
    family?: string;
    keepOpen?: boolean;
  }) => {
    const qs = new URLSearchParams(preserved.toString());
    qs.set("lang", lang);
    const letterValue = nextLetter ?? letter;
    if (letterValue) qs.set("letter", letterValue);
    else qs.delete("letter");
    const qValue = nextQuery ?? currentQ;
    if (qValue) qs.set("q", qValue);
    else qs.delete("q");
    if (family) qs.set("family", family);
    else qs.delete("family");
    if (keepOpen) qs.set("filters", "open");
    else qs.delete("filters");
    const queryString = qs.toString();
    router.push(queryString ? `/families?${queryString}` : "/families");
  };

  const closeSheet = () => {
    setOpen(false);
    const qs = new URLSearchParams(preserved.toString());
    qs.delete("filters");
    const queryString = qs.toString();
    router.replace(queryString ? `/families?${queryString}` : "/families");
  };

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            navigate({ keepOpen: true });
          }}
          className="w-full flex items-center justify-between rounded-2xl border border-haiti-ink/15 bg-white/90 px-4 py-3 text-sm font-semibold text-haiti-navy shadow-card"
          aria-expanded={open}
          aria-controls="mobile-families-filters"
        >
          <span>{msg(lang, "filtersTitle")}</span>
          <span className="text-xs text-haiti-ink/70">
            {letter === "ALL" ? allLabel : letter}
          </span>
        </button>
      </div>

      {open && (
        <div
          id="mobile-families-filters"
          className="fixed inset-0 z-50 bg-white"
          role="dialog"
          aria-modal="true"
          aria-label={msg(lang, "filtersTitle")}
        >
          <div className="flex flex-col h-full pt-6 pb-8 px-4 overflow-y-auto">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-haiti-ink/10">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-haiti-ink/60">
                  {msg(lang, "navFamilies")}
                </div>
                <div className="text-base font-semibold text-haiti-navy">
                  {msg(lang, "filtersTitle")}
                </div>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full border border-haiti-ink/15 px-4 py-2 text-xs font-semibold text-haiti-ink hover:border-haiti-ink/40"
              >
                {msg(lang, "close")}
              </button>
            </div>

            <form
              className="space-y-4 pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const nextQuery = (form.get("q")?.toString() ?? "").trim();
                navigate({ nextLetter: letter, nextQuery, keepOpen: true });
              }}
            >
              <div className="space-y-2">
                <div className="text-sm font-semibold text-haiti-navy">
                  {searchLabel}
                </div>
                <input
                  name="q"
                  defaultValue={currentQ}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-haiti-coral focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-haiti-navy">
                  {letterJumpLabel}
                </div>
                <div className="flex flex-wrap gap-2">
                  <LetterChip
                    lang={lang}
                    letter="ALL"
                    active={letter === "ALL"}
                    allLabel={allLabel}
                    onClick={() => navigate({ nextLetter: "ALL", keepOpen: true })}
                  />
                  {LETTERS.map((l) => (
                    <LetterChip
                      key={l}
                      lang={lang}
                      letter={l}
                      active={letter === l}
                      allLabel={allLabel}
                      onClick={() => navigate({ nextLetter: l, keepOpen: true })}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-haiti-coral to-haiti-sky text-white font-semibold shadow-card hover:translate-y-[1px] transition text-sm"
              >
                {msg(lang, "searchCta")}
              </button>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-haiti-navy">
                  {familiesLabel}
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {families.map((fam) => {
                    const familyName = fam.nom ?? "";
                    const href = buildPathWithParams({
                      pathname: "/families",
                      preserved,
                      lang,
                      params: {
                        letter,
                        q: currentQ,
                        family: familyName,
                      },
                    });
                    return (
                      <Link
                        key={familyName}
                        href={href}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                          selectedFamily === fam.nom
                            ? "border-haiti-coral bg-white shadow-sm"
                            : "border-white/60 bg-white/70 hover:border-haiti-coral/60"
                        }`}
                        onClick={(event) => {
                          event.preventDefault();
                          navigate({ family: familyName, keepOpen: false });
                          setOpen(false);
                        }}
                      >
                        <div className="text-sm font-semibold text-haiti-navy">
                          {familyName}
                        </div>
                        <div className="text-xs text-haiti-ink/70 bg-white/70 rounded-full px-3 py-1 border border-white/60">
                          {fam._count._all}
                        </div>
                      </Link>
                    );
                  })}
                  {families.length === 0 && (
                    <div className="text-xs text-haiti-ink/70">
                      {noFamilies}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function LetterChip({
  letter,
  active,
  allLabel,
  onClick,
}: {
  letter: string;
  active: boolean;
  allLabel: string;
  onClick: () => void;
}) {
  const label = letter === "ALL" ? allLabel : letter;
  return (
    <Chip
      label={label}
      active={active}
      onClick={onClick}
    />
  );
}
