import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/app/components/common/PageHero";
import { Navbar } from "@/app/components/common/Navbar";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import { PersonCard } from "@/app/components/common/PersonCard";
import { MemberGate } from "@/app/components/common/MemberGate";
import { msg, type Locale } from "@/app/i18n";
import { canAccessGenealogy, getCurrentUser, isMember } from "@/lib/auth";
import { selectCopy, type LocalizedCopy } from "@/lib/copy";
import {
  buildPreservedForLink,
  getPageContext,
  parseIdOrNotFound,
  type SearchParamsInput,
} from "@/lib/page-params";
import { prisma } from "@/lib/prisma";

type Params = { id: string };

type PersonCopy = {
  eyebrow: string;
  heroTitle: (name: string) => string;
  registerCta: string;
  openTreeCta: string;
  identity: string;
  birthPlace: string;
  deathPlace: string;
  occupation: string;
  reference: string;
  source: string;
  letter: string;
  comments: string;
  relationships: {
    parents: string;
    siblings: string;
    spouses: string;
    children: string;
    empty: string;
    noChildren: string;
    noSiblings: string;
  };
};

const PERSON_COPY: LocalizedCopy<PersonCopy> = {
  fr: {
    eyebrow: "Profil généalogique",
    heroTitle: (name: string) => `Fiche de ${name}`.trim(),
    registerCta: "Retour au registre",
    openTreeCta: "Voir l'arbre interactif",
    identity: "Identité",
    birthPlace: "Lieu de naissance",
    deathPlace: "Lieu de décès",
    occupation: "Occupation",
    reference: "Référence",
    source: "Source",
    letter: "Lettre",
    comments: "Commentaires",
    relationships: {
      parents: "Parents",
      siblings: "Frères et sœurs",
      spouses: "Conjoint(e)s",
      children: "Enfants",
      empty: "Non renseigné",
      noChildren: "Aucun enfant trouvé",
      noSiblings: "Aucun frère ou sœur trouvé",
    },
  },
  en: {
    eyebrow: "Genealogy profile",
    heroTitle: (name: string) => `Profile of ${name}`.trim(),
    registerCta: "Back to register",
    openTreeCta: "Open interactive tree",
    identity: "Identity",
    birthPlace: "Birth place",
    deathPlace: "Death place",
    occupation: "Occupation",
    reference: "Reference",
    source: "Source",
    letter: "Letter",
    comments: "Comments",
    relationships: {
      parents: "Parents",
      siblings: "Siblings",
      spouses: "Spouses",
      children: "Children",
      empty: "Not provided",
      noChildren: "No children found",
      noSiblings: "No siblings found",
    },
  },
  es: {
    eyebrow: "Perfil genealógico",
    heroTitle: (name: string) => `Ficha de ${name}`.trim(),
    registerCta: "Volver al registro",
    openTreeCta: "Ver árbol interactivo",
    identity: "Identidad",
    birthPlace: "Lugar de nacimiento",
    deathPlace: "Lugar de fallecimiento",
    occupation: "Ocupación",
    reference: "Referencia",
    source: "Fuente",
    letter: "Letra",
    comments: "Comentarios",
    relationships: {
      parents: "Padres",
      siblings: "Hermanos",
      spouses: "Cónyuges",
      children: "Hijos",
      empty: "No indicado",
      noChildren: "No se encontraron hijos",
      noSiblings: "No se encontraron hermanos",
    },
  },
  ht: {
    eyebrow: "Pwofil jeneyaloji",
    heroTitle: (name: string) => `Fich ${name}`.trim(),
    registerCta: "Retounen nan rejis la",
    openTreeCta: "Gade pyebwa entèaktif la",
    identity: "Idantite",
    birthPlace: "Kote nesans",
    deathPlace: "Kote lanmò",
    occupation: "Metye",
    reference: "Referans",
    source: "Sous",
    letter: "Lèt",
    comments: "Kòmantè",
    relationships: {
      parents: "Paran",
      siblings: "Frè ak sè",
      spouses: "Konsò",
      children: "Timoun",
      empty: "Pa ranpli",
      noChildren: "Pa jwenn okenn timoun",
      noSiblings: "Pa jwenn okenn frè oswa sè",
    },
  },
};

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Params | Promise<Params>;
  searchParams: SearchParamsInput;
}) {
  const resolvedParams = await params;
  const { lang, preserved } = await getPageContext(searchParams);
  const copy = selectCopy(PERSON_COPY, lang);
  const user = await getCurrentUser();
  const member = isMember(user);
  const canViewGenealogy = canAccessGenealogy(user);

  const idNum = parseIdOrNotFound(resolvedParams.id);

  if (!canViewGenealogy) {
    return (
      <div className="min-h-screen text-haiti-ink">
        <Navbar
          lang={lang}
          preserved={preserved}
          msg={msg}
          isMember={member}
          username={user?.usager}
          pathname={`/person/${idNum}`}
        />
        <main className="page-shell py-12 space-y-6">
          <MemberGate
            lang={lang}
            preserved={preserved}
            msg={msg}
            title={copy.eyebrow}
            backHref="/families"
          />
        </main>
      </div>
    );
  }

  const person = await prisma.genea.findUnique({ where: { id: idNum } });
  if (!person) notFound();

  const parentIds = [person.pere, person.mere].filter(
    (v): v is number => v != null && v > 0,
  );

  const [parents, children, marriages, siblings] = await Promise.all([
    parentIds.length > 0
      ? prisma.genea.findMany({
          where: { id: { in: parentIds } },
        })
      : Promise.resolve([]),
    prisma.genea.findMany({
      where: { OR: [{ pere: idNum }, { mere: idNum }] },
      orderBy: [{ date_naissance: "asc" }, { prenom: "asc" }],
      take: 200,
    }),
    prisma.genea2.findMany({
      where: { OR: [{ pere: idNum }, { mere: idNum }] },
      take: 50,
    }),
    parentIds.length > 0
      ? prisma.genea.findMany({
          where: {
            id: { not: idNum },
            OR: [{ pere: { in: parentIds } }, { mere: { in: parentIds } }],
          },
          orderBy: [{ date_naissance: "asc" }, { prenom: "asc" }],
          take: 200,
        })
      : Promise.resolve([]),
  ]);

  const spouseIds = Array.from(
    new Set(
      marriages
        .map((m) => (m.pere === idNum ? m.mere : m.pere))
        .filter((v): v is number => v != null && v > 0),
    ),
  );
  const spouses =
    spouseIds.length > 0
      ? await prisma.genea.findMany({ where: { id: { in: spouseIds } } })
      : [];

  const fullName =
    `${person.prenom ?? ""} ${person.nom ?? ""}`.trim() || `#${person.id}`;
  const dateRange = `${person.date_naissance ?? "…"} – ${person.date_mort ?? "…"}`;
  const relationshipStats = [
    { label: copy.relationships.parents, value: parents.length },
    { label: copy.relationships.siblings, value: siblings.length },
    { label: copy.relationships.spouses, value: spouses.length },
    { label: copy.relationships.children, value: children.length },
  ];

  return (
    <div className="min-h-screen text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={member}
        username={user?.usager}
        pathname={`/person/${idNum}`}
      />

      <main className="page-shell py-12 space-y-8 2xl:space-y-10">
        <PageHero
          eyebrow={copy.eyebrow}
          title={copy.heroTitle(fullName)}
          description={dateRange}
          backgroundImage={{ src: "/home_hero2.jpg", alt: "Historic family records" }}
          actions={
            <div className="flex flex-wrap gap-3">
              <Link
                href={buildPreservedForLink("/families", undefined, {
                  lang,
                  params: { family: person.nom ?? "" },
                })}
                className="px-5 py-3 rounded-full border border-haiti-ink/15 text-haiti-ink text-sm font-semibold bg-white/70 hover:border-haiti-ink/40 transition"
              >
                {copy.registerCta}
              </Link>
              <Link
                href={buildPreservedForLink("/tree", undefined, {
                  lang,
                  params: { person: idNum },
                })}
                className="px-5 py-3 rounded-full bg-gradient-to-r from-haiti-coral to-haiti-sky text-white text-sm font-semibold shadow-lg shadow-haiti-coral/30 hover:translate-y-[1px] transition"
              >
                {copy.openTreeCta}
              </Link>
            </div>
          }
          aside={
            <div className="space-y-3">
              <div className="text-base font-semibold text-haiti-navy">
                {copy.identity}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {relationshipStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-center"
                  >
                    <div className="text-[11px] uppercase tracking-[0.1em] text-haiti-ink/60">
                      {stat.label}
                    </div>
                    <div className="text-lg font-bold text-haiti-navy">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          <div className="glass-panel rounded-2xl p-6 space-y-3 lg:col-span-2 2xl:col-span-3">
            <div className="text-sm uppercase tracking-[0.15em] text-haiti-ink/60">
              {copy.identity}
            </div>
            <div className="text-2xl font-bold text-haiti-navy">
              {fullName}
            </div>
            <div className="text-sm text-haiti-ink/80">
              {dateRange}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-haiti-ink/80">
              <InfoRow label={copy.birthPlace} value={person.lieu_naissance} />
              <InfoRow label={copy.deathPlace} value={person.lieu_mort} />
              <InfoRow label={copy.occupation} value={person.occupation} />
              <InfoRow label={copy.reference} value={person.refno} />
              <InfoRow label={copy.source} value={person.source} />
              <InfoRow label={copy.letter} value={person.lettre} />
            </div>
            {person.commentaires && (
              <div className="rounded-xl border border-white/70 bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.1em] text-haiti-ink/60">
                  {copy.comments}
                </div>
                <p className="mt-1 text-sm text-haiti-ink/80 whitespace-pre-line">
                  {person.commentaires}
                </p>
              </div>
            )}
          </div>

          <RelationshipCard
            title={copy.relationships.parents}
            emptyLabel={copy.relationships.empty}
            people={parents}
            lang={lang}
          />
          <RelationshipCard
            title={copy.relationships.spouses}
            emptyLabel={copy.relationships.empty}
            people={spouses}
            lang={lang}
          />
          <RelationshipCard
            title={copy.relationships.siblings}
            emptyLabel={copy.relationships.noSiblings}
            people={siblings}
            lang={lang}
          />
          <RelationshipCard
            title={copy.relationships.children}
            emptyLabel={copy.relationships.noChildren}
            people={children}
            lang={lang}
          />
        </section>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-white/60 bg-white/70 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.1em] text-haiti-ink/60">
        {label}
      </div>
      <div className="text-sm text-haiti-ink/90">{value ?? "—"}</div>
    </div>
  );
}

type PersonRecord = {
  id: number;
  prenom: string | null;
  nom: string | null;
  date_naissance: string | null;
  date_mort: string | null;
};

function RelationshipCard({
  title,
  emptyLabel,
  people,
  lang,
}: {
  title: string;
  emptyLabel: string;
  people: PersonRecord[];
  lang: Locale;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 space-y-2">
      <div className="text-sm font-semibold text-haiti-navy">{title}</div>
      {people.length === 0 && (
        <StatusMessage className="text-xs">{emptyLabel}</StatusMessage>
      )}
      {people.length > 0 && (
        <div className="space-y-2">
          {people.map((p) => (
            <PersonCard
              key={p.id}
              id={p.id}
              name={`${p.prenom ?? ""} ${p.nom ?? ""}`.trim()}
              dates={`${p.date_naissance ?? "…"} – ${p.date_mort ?? "…"}`}
              href={buildPreservedForLink(`/person/${p.id}`, undefined, { lang })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
