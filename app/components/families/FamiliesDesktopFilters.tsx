'use client';

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Chip } from "@/app/components/common/Chip";
import type { Locale } from "@/app/i18n";
import { buildPathWithParams } from "@/lib/page-params";

type FamiliesDesktopFiltersProps = {
  lang: Locale;
  letter: string;
  query: string;
  families: { nom: string | null; _count: { _all: number } }[];
  selectedFamily: string;
  copy: {
    searchLabel: string;
    searchPlaceholder: string;
    filterCta: string;
    letterJump: string;
    allLabel: string;
    familiesLabel: string;
    noFamilies: string;
  };
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function FamiliesDesktopFilters({
  lang,
  letter,
  query,
  families,
  selectedFamily,
  copy,
}: FamiliesDesktopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preserved = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const currentQ = searchParams.get("q") ?? query ?? "";

  const navigate = (params: { letter?: string; q?: string; family?: string }) => {
    const qs = new URLSearchParams(preserved.toString());
    qs.set("lang", lang);
    const nextLetter = params.letter ?? letter;
    if (nextLetter) qs.set("letter", nextLetter);
    else qs.delete("letter");
    const nextQ = params.q ?? currentQ;
    if (nextQ) qs.set("q", nextQ);
    else qs.delete("q");
    if (params.family) qs.set("family", params.family);
    else qs.delete("family");
    const queryString = qs.toString();
    router.push(queryString ? `/families?${queryString}` : "/families");
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-5 hidden lg:block">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const nextQ = (form.get("q")?.toString() ?? "").trim();
          navigate({ q: nextQ, letter });
        }}
      >
        <div className="text-sm font-semibold text-haiti-navy">
          {copy.searchLabel}
        </div>
        <input
          name="q"
          defaultValue={currentQ}
          placeholder={copy.searchPlaceholder}
          className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-haiti-coral focus:outline-none"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-haiti-coral to-haiti-sky text-white font-semibold shadow-card hover:translate-y-[1px] transition text-sm"
        >
          {copy.filterCta}
        </button>
      </form>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-haiti-navy">
          {copy.letterJump}
        </div>
        <div className="flex flex-wrap gap-2">
          <LetterChip
            lang={lang}
            letter="ALL"
            active={letter === "ALL"}
            allLabel={copy.allLabel}
            onClick={() => navigate({ letter: "ALL" })}
          />
          {LETTERS.map((l) => (
            <LetterChip
              key={l}
              lang={lang}
              letter={l}
              active={letter === l}
              allLabel={copy.allLabel}
              onClick={() => navigate({ letter: l })}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-haiti-navy">
          {copy.familiesLabel}
        </div>
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
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
                  navigate({ family: familyName });
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
              {copy.noFamilies}
            </div>
          )}
        </div>
      </div>
    </div>
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
