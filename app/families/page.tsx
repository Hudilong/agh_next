import Link from "next/link";

import { PageHero } from "@/app/components/common/PageHero";
import { Navbar } from "@/app/components/common/Navbar";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import { Chip } from "@/app/components/common/Chip";
import { PersonCard } from "@/app/components/common/PersonCard";
import { msg } from "@/app/i18n";
import { getCurrentUser, isMember } from "@/lib/auth";
import { selectCopy, type LocalizedCopy } from "@/lib/copy";
import { FamiliesFiltersSheet } from "@/app/components/families/FamiliesFiltersSheet";
import { FamiliesDesktopFilters } from "@/app/components/families/FamiliesDesktopFilters";
import {
  buildPathWithParams,
  buildPreservedForLink,
  firstParam,
  getPageContext,
  type SearchParamsInput,
} from "@/lib/page-params";
import { prisma } from "@/lib/prisma";

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

      <main className="page-shell py-12 space-y-10 2xl:space-y-12">
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

        <div className="grid gap-6 2xl:gap-8 lg:grid-cols-[320px,1fr] 2xl:grid-cols-[360px,1fr] 3xl:grid-cols-[400px,1fr]">
          <aside className="space-y-5">
            <FamiliesFiltersSheet
              lang={lang}
              letter={letter}
              query={query}
              allLabel={copy.allLabel}
              letterJumpLabel={copy.letterJump}
              searchLabel={copy.searchLabel}
              searchPlaceholder={copy.searchPlaceholder}
              families={families}
              selectedFamily={selectedFamily}
              familiesLabel={copy.familiesLabel}
              noFamilies={copy.noFamilies}
            />

            <FamiliesDesktopFilters
              lang={lang}
              letter={letter}
              query={query}
              families={families}
              selectedFamily={selectedFamily}
              copy={{
                searchLabel: copy.searchLabel,
                searchPlaceholder: copy.searchPlaceholder,
                filterCta: copy.filterCta,
                letterJump: copy.letterJump,
                allLabel: copy.allLabel,
                familiesLabel: copy.familiesLabel,
                noFamilies: copy.noFamilies,
              }}
            />
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
                  {(() => {
                    const cleared = new URLSearchParams(preserved);
                    cleared.delete("family");
                    cleared.delete("filters");
                    const href = buildPathWithParams({
                      pathname: "/families",
                      preserved: cleared,
                      lang,
                      params: { letter, q: query },
                    });
                    return (
                  <Link
                        href={href}
                    className="text-sm px-4 py-2 rounded-full border border-haiti-ink/15 text-haiti-ink font-semibold bg-white/70 hover:border-haiti-ink/40 transition"
                  >
                    {copy.clearSelection}
                  </Link>
                    );
                  })()}
                </div>
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3 2xl:gap-4">
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
