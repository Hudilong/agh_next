import Link from "next/link";

import { PageHero } from "@/app/components/common/PageHero";
import { Navbar } from "@/app/components/common/Navbar";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import { Chip } from "@/app/components/common/Chip";
import { PersonCard } from "@/app/components/common/PersonCard";
import { msg, type Locale } from "@/app/i18n";
import { getCurrentUser, isMember } from "@/lib/auth";
import { selectCopy, type LocalizedCopy } from "@/lib/copy";
import {
  buildPathWithParams,
  buildPreservedForLink,
  firstParam,
  getPageContext,
  type SearchParamsInput,
} from "@/lib/page-params";
import { prisma } from "@/lib/prisma";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type FamiliesCopy = {
  eyebrow: string;
  asideTitle: string;
  asideCopy: string;
  searchLabel: string;
  searchPlaceholder: string;
  filterCta: string;
  letterJump: string;
  allLabel: string;
  familiesLabel: string;
  noFamilies: string;
  selectedFamily: string;
  peopleFound: (count: number) => string;
  clearSelection: string;
  viewProfile: string;
  emptyPeople: string;
  selectPrompt: string;
  loading: string;
};

const FAMILIES_COPY: LocalizedCopy<FamiliesCopy> = {
  fr: {
    eyebrow: "Généalogie",
    asideTitle: "Comment ça marche",
    asideCopy:
      "Naviguez par lettre ou recherchez un nom, sélectionnez une famille puis ouvrez la fiche d'une personne pour accéder à l'arbre.",
    searchLabel: "Recherche",
    searchPlaceholder: "Nom de famille...",
    filterCta: "Filtrer",
    letterJump: "Saut alphabétique",
    allLabel: "Toutes",
    familiesLabel: "Familles",
    noFamilies: "Aucun résultat.",
    selectedFamily: "Famille sélectionnée",
    peopleFound: (count: number) =>
      `${count} personne${count > 1 ? "s" : ""} trouvée${count > 1 ? "s" : ""}`,
    clearSelection: "Effacer la sélection",
    viewProfile: "Voir la fiche",
    emptyPeople: "Aucune personne trouvée pour cette famille.",
    selectPrompt: "Choisissez une famille dans la liste pour voir les personnes.",
    loading: "Chargement...",
  },
  en: {
    eyebrow: "Genealogy",
    asideTitle: "How it works",
    asideCopy:
      "Jump by letter or search a name, pick a family, then open a profile to explore the tree.",
    searchLabel: "Search",
    searchPlaceholder: "Family name...",
    filterCta: "Filter",
    letterJump: "A–Z jump",
    allLabel: "All",
    familiesLabel: "Families",
    noFamilies: "No results.",
    selectedFamily: "Selected family",
    peopleFound: (count: number) => `${count} person${count === 1 ? "" : "s"} found`,
    clearSelection: "Clear selection",
    viewProfile: "View profile",
    emptyPeople: "No people found for this family.",
    selectPrompt: "Pick a family from the list to see its people.",
    loading: "Loading...",
  },
  es: {
    eyebrow: "Genealogía",
    asideTitle: "Cómo funciona",
    asideCopy:
      "Salta por letra o busca un nombre, elige una familia y abre la ficha de una persona para explorar el árbol.",
    searchLabel: "Búsqueda",
    searchPlaceholder: "Apellido...",
    filterCta: "Filtrar",
    letterJump: "Salto A–Z",
    allLabel: "Todas",
    familiesLabel: "Familias",
    noFamilies: "Sin resultados.",
    selectedFamily: "Familia seleccionada",
    peopleFound: (count: number) =>
      `${count} persona${count === 1 ? "" : "s"} encontrada${count === 1 ? "" : "s"}`,
    clearSelection: "Borrar selección",
    viewProfile: "Ver ficha",
    emptyPeople: "No se encontraron personas para esta familia.",
    selectPrompt: "Elige una familia de la lista para ver sus personas.",
    loading: "Cargando...",
  },
  ht: {
    eyebrow: "Jeneyaloji",
    asideTitle: "Kijan li mache",
    asideCopy:
      "Sote pa lèt oswa chèche yon non, chwazi yon fanmi epi louvri fich yon moun pou eksplore pyebwa a.",
    searchLabel: "Rechèch",
    searchPlaceholder: "Non fanmi...",
    filterCta: "Filtre",
    letterJump: "Sote A–Z",
    allLabel: "Tout",
    familiesLabel: "Fanmi",
    noFamilies: "Pa gen rezilta.",
    selectedFamily: "Fanmi chwazi a",
    peopleFound: (count: number) =>
      `${count} moun jwenn`,
    clearSelection: "Efase seleksyon an",
    viewProfile: "Gade fich la",
    emptyPeople: "Pa gen moun pou fanmi sa a.",
    selectPrompt: "Chwazi yon fanmi nan lis la pou wè moun yo.",
    loading: "Chajman...",
  },
};

export default async function FamiliesRegisterPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const { params, lang, preserved } = await getPageContext(searchParams);
  const copy = selectCopy(FAMILIES_COPY, lang);
  const user = await getCurrentUser();
  const member = isMember(user);
  const letter = firstParam(params.letter)?.toUpperCase() ?? "ALL";
  const query = firstParam(params.q)?.trim() ?? "";
  const selectedFamily = firstParam(params.family) ?? "";

  const familyFilter = {
    AND: [
      { nom: { not: null } },
      ...(letter !== "ALL" ? [{ lettre: letter }] : []),
      ...(query.length > 0 ? [{ nom: { contains: query } }] : []),
    ],
  };

  const families = await prisma.genea.groupBy({
    by: ["nom"],
    _count: { _all: true },
    where: familyFilter,
    orderBy: { nom: "asc" },
    take: 300,
  });

  const people =
    selectedFamily.length > 0
      ? await prisma.genea.findMany({
          where: { nom: selectedFamily },
          orderBy: [{ prenom: "asc" }, { date_naissance: "asc" }],
          take: 200,
        })
      : [];

  return (
    <div className="min-h-screen text-haiti-ink">
      <Navbar
        lang={lang}
      preserved={preserved}
      msg={msg}
      isMember={member}
      username={user?.usager}
      pathname="/families"
    />

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <PageHero
          eyebrow={copy.eyebrow}
          title={msg(lang, "familiesHeroTitle")}
          description={msg(lang, "familiesHeroSubtitle")}
          backgroundImage={{ src: "/home_hero2.jpg", alt: "Family archive shelves" }}
          aside={
            <div className="space-y-2 text-sm text-haiti-ink/80">
              <div className="text-base font-semibold text-haiti-navy">
                {copy.asideTitle}
              </div>
              <p>{copy.asideCopy}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {[copy.letterJump, copy.searchLabel, copy.viewProfile].map((label) => (
                  <Chip key={label} label={label} />
                ))}
              </div>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="glass-panel rounded-2xl p-5 space-y-5">
            <form className="space-y-3">
              <div className="text-sm font-semibold text-haiti-navy">
                {copy.searchLabel}
              </div>
              <input
                name="q"
                defaultValue={query}
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
                    preserved={preserved}
                  />
                  {LETTERS.map((l) => (
                    <LetterChip
                      key={l}
                      lang={lang}
                      letter={l}
                      active={letter === l}
                      allLabel={copy.allLabel}
                      preserved={preserved}
                    />
                  ))}
                </div>
              </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-haiti-navy">
                {copy.familiesLabel}
              </div>
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {families.map((fam) => (
                  <Link
                    key={fam.nom ?? ""}
                    href={buildPathWithParams({
                      pathname: "/families",
                      preserved,
                      lang,
                      params: {
                        letter,
                        q: query,
                        family: fam.nom ?? "",
                      },
                    })}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                      selectedFamily === fam.nom
                        ? "border-haiti-coral bg-white shadow-sm"
                        : "border-white/60 bg-white/70 hover:border-haiti-coral/60"
                    }`}
                  >
                    <div className="text-sm font-semibold text-haiti-navy">
                      {fam.nom}
                    </div>
                    <div className="text-xs text-haiti-ink/70 bg-white/70 rounded-full px-3 py-1 border border-white/60">
                      {fam._count._all}
                    </div>
                  </Link>
                ))}
                {families.length === 0 && (
                  <StatusMessage className="text-xs">
                    {copy.noFamilies}
                  </StatusMessage>
                )}
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            {selectedFamily ? (
              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-haiti-ink/60">
                      {copy.selectedFamily}
                    </div>
                    <div className="text-2xl font-bold text-haiti-navy">
                      {selectedFamily}
                    </div>
                    <div className="text-sm text-haiti-ink/70">
                      {copy.peopleFound(people.length)}
                    </div>
                  </div>
                  <Link
                    href={buildPathWithParams({
                      pathname: "/families",
                      preserved,
                      lang,
                      params: { letter, q: query },
                    })}
                    className="text-sm px-4 py-2 rounded-full border border-haiti-ink/15 text-haiti-ink font-semibold bg-white/70 hover:border-haiti-ink/40 transition"
                  >
                    {copy.clearSelection}
                  </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {people.map((p) => (
                    <PersonCard
                      key={p.id}
                      id={p.id}
                      name={`${p.prenom ?? ""} ${p.nom ?? ""}`.trim()}
                      dates={`${p.date_naissance ?? "…"} – ${p.date_mort ?? "…"}`}
                      href={buildPreservedForLink(`/person/${p.id}`, undefined, { lang })}
                      footer={`${copy.viewProfile} →`}
                    />
                  ))}
                  {people.length === 0 && (
                    <div className="text-sm text-haiti-ink/70">
                      {copy.emptyPeople}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <StatusMessage className="p-6">
                {copy.selectPrompt}
              </StatusMessage>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function LetterChip({
  lang,
  letter,
  active,
  allLabel,
  preserved,
}: {
  lang: Locale;
  letter: string;
  active: boolean;
  allLabel: string;
  preserved: URLSearchParams;
}) {
  const label =
    letter === "ALL" ? allLabel : letter;
  const href = buildPathWithParams({
    pathname: "/families",
    preserved,
    lang,
    params: { letter },
  });
  return (
    <Chip href={href} label={label} active={active} />
  );
}
