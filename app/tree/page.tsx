import { PageHero } from "@/app/components/common/PageHero";
import { Navbar } from "@/app/components/common/Navbar";
import { MemberGate } from "@/app/components/common/MemberGate";
import { msg } from "@/app/i18n";
import { canAccessGenealogy, getCurrentUser, isMember } from "@/lib/auth";
import { selectCopy, type LocalizedCopy } from "@/lib/copy";
import {
  firstParam,
  getPageContext,
  parseOptionalNumber,
  type SearchParamsInput,
} from "@/lib/page-params";
import { GenealogyExplorer, type TreeCopy } from "./GenealogyExplorer";

const TREE_COPY: LocalizedCopy<TreeCopy> = {
  fr: {
    quickSearch: "Recherche rapide",
    searchPlaceholder: "Nom, famille, lieu...",
    letterJump: "Saut alphabétique",
    allLabel: "Toutes",
    peopleLabel: "Personnes",
    noResults: "Aucun résultat",
    tipsTitle: "Navigation conseillée",
    tips: [
      "Utilisez Asc/Desc pour changer de direction.",
      "Limitez la profondeur pour garder la lisibilité.",
      "Cliquez sur un nom pour centrer l’arbre.",
    ],
    focusedPerson: "Personne centrale",
    ascendancy: "Ascendance",
    descendancy: "Descendance",
    depth: "Profondeur",
    choosePerson:
      "Choisissez une personne depuis le registre pour afficher son arbre.",
    loading: "Chargement...",
    errorPrefix: "Erreur:",
  },
  en: {
    quickSearch: "Quick search",
    searchPlaceholder: "Name, family, place...",
    letterJump: "A–Z jump",
    allLabel: "All",
    peopleLabel: "People",
    noResults: "No results",
    tipsTitle: "Navigation tips",
    tips: [
      "Toggle Asc/Desc to swap direction.",
      "Limit depth to keep things readable.",
      "Click a name to focus the tree.",
    ],
    focusedPerson: "Focused person",
    ascendancy: "Ascendancy",
    descendancy: "Descendancy",
    depth: "Depth",
    choosePerson: "Choose a person from the register to display their tree.",
    loading: "Loading...",
    errorPrefix: "Error:",
  },
  es: {
    quickSearch: "Búsqueda rápida",
    searchPlaceholder: "Nombre, familia, lugar...",
    letterJump: "Salto A–Z",
    allLabel: "Todas",
    peopleLabel: "Personas",
    noResults: "Sin resultados",
    tipsTitle: "Consejos de navegación",
    tips: [
      "Alterna Asc/Desc para cambiar de dirección.",
      "Limita la profundidad para mantener la claridad.",
      "Haz clic en un nombre para centrar el árbol.",
    ],
    focusedPerson: "Persona central",
    ascendancy: "Ascendencia",
    descendancy: "Descendencia",
    depth: "Profundidad",
    choosePerson: "Elige una persona del registro para mostrar su árbol.",
    loading: "Cargando...",
    errorPrefix: "Error:",
  },
  ht: {
    quickSearch: "Rechèch rapid",
    searchPlaceholder: "Non, fanmi, kote...",
    letterJump: "Sote A–Z",
    allLabel: "Tout",
    peopleLabel: "Moun yo",
    noResults: "Pa gen rezilta",
    tipsTitle: "Konsèy navigasyon",
    tips: [
      "Chanje Asc/Desc pou chanje direksyon an.",
      "Limite pwofondè pou kenbe klè.",
      "Klike sou yon non pou santre pyebwa a.",
    ],
    focusedPerson: "Moun santre",
    ascendancy: "Zansèt",
    descendancy: "Desandan",
    depth: "Pwofondè",
    choosePerson: "Chwazi yon moun nan rejis la pou montre pyebwa li.",
    loading: "Chajman...",
    errorPrefix: "Erè:",
  },
};

export default async function GenealogyPlaceholderPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const { params, lang, preserved } = await getPageContext(searchParams);
  const copy = selectCopy(TREE_COPY, lang);
  const personParam = firstParam(params.person);
  const initialPersonId = parseOptionalNumber(personParam);
  const user = await getCurrentUser();
  const member = isMember(user);
  const canViewGenealogy = canAccessGenealogy(user);

  return (
    <div className="min-h-screen text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={member}
        username={user?.usager}
        pathname="/tree"
      />
      <main className="page-shell py-12 space-y-10 2xl:space-y-12">
        {canViewGenealogy ? (
          <>
            <PageHero
              eyebrow={msg(lang, "navTree")}
              title={msg(lang, "treeHeroTitle")}
              description={msg(lang, "treeHeroSubtitle")}
              backgroundImage={{ src: "/home_hero.jpg", alt: "Historic landscape view" }}
              aside={
                <div className="space-y-2 text-sm text-haiti-ink/80">
                  <div className="text-base font-semibold text-haiti-navy">
                    {copy.tipsTitle}
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {copy.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              }
            />
            <GenealogyExplorer
              lang={lang}
              initialPersonId={initialPersonId}
              copy={copy}
            />
          </>
        ) : (
          <MemberGate
            lang={lang}
            preserved={preserved}
            msg={msg}
            title={msg(lang, "treeHeroTitle")}
            backHref="/families"
          />
        )}
      </main>
    </div>
  );
}
