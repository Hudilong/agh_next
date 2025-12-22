import { Navbar } from "@/app/components/common/Navbar";
import { msg } from "@/app/i18n";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import { PageHero } from "@/app/components/common/PageHero";
import { MemberGate } from "@/app/components/common/MemberGate";
import { canAccessArchives, getCurrentUser, isMember } from "@/lib/auth";
import { formatLongDate } from "@/lib/format";
import {
  buildRoleLabelMap,
  buildTypeacteLabelMap,
} from "@/lib/labels";
import {
  buildPathWithParams,
  getPageContext,
  parseIdOrNotFound,
  type SearchParamsInput,
} from "@/lib/page-params";
import { prisma } from "@/lib/prisma";

export default async function ActDetailPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams: SearchParamsInput;
}) {
  const resolvedParams = await params;
  const { lang, preserved } = await getPageContext(searchParams);
  const user = await getCurrentUser();
  const member = isMember(user);
  const canViewArchives = canAccessArchives(user);
  const actId = parseIdOrNotFound(resolvedParams.id);

  if (!canViewArchives) {
    return (
      <div className="min-h-screen text-haiti-ink">
        <Navbar
          lang={lang}
          preserved={preserved}
          msg={msg}
          isMember={member}
          username={user?.usager}
          pathname={`/acts/${resolvedParams.id}`}
        />
        <main className="max-w-6xl mx-auto px-6 py-12 space-y-6">
          <MemberGate
            lang={lang}
            preserved={preserved}
            msg={msg}
            title={`${msg(lang, "actDetailTitle")} #${resolvedParams.id}`}
            backHref="/archives"
            eyebrow="AGH Archives"
            description={msg(lang, "supportOnly")}
          />
        </main>
      </div>
    );
  }

  const [
    act,
    participants,
    typeacte,
    roles,
    communes,
    pays,
    officiers,
    metiers,
  ] = await Promise.all([
    prisma.actes.findUnique({ where: { id: actId } }),
    prisma.personnes.findMany({
      where: { acte: actId },
      orderBy: { id: "asc" },
    }),
    prisma.$queryRaw<{ code: string | null; nom: string | null }[]>`
      SELECT code, nom FROM typeacte WHERE code IS NOT NULL
    `,
    prisma.role.findMany({ select: { id: true, role: true } }),
    prisma.communes.findMany({
      select: { id: true, commune: true, codepays: true },
    }),
    prisma.pays.findMany({
      select: { codepays: true, paysfrancais: true, paysanglais: true },
    }),
    prisma.officiers.findMany({ select: { id: true, nomprenom: true } }),
    prisma.metiers.findMany({ select: { id: true, metier: true } }),
  ]);

  const typeLabels = buildTypeacteLabelMap(
    typeacte.filter((t): t is { code: string; nom: string | null } => Boolean(t.code)),
  );
  const roleLabels = buildRoleLabelMap(roles);
  const communeMap = new Map(
    communes.map((c) => [
      String(c.id),
      { name: c.commune ?? String(c.id), codepays: c.codepays },
    ]),
  );
  const paysMap = new Map(
    pays.map((p) => [
      p.codepays,
      { fr: p.paysfrancais ?? p.codepays, en: p.paysanglais ?? p.codepays },
    ]),
  );
  const officierMap = new Map(officiers.map((o) => [o.id, o.nomprenom ?? ""]));
  const metiersMap = new Map(metiers.map((m) => [m.id, m.metier ?? ""]));

  const placeLabel = (id: number | null | undefined) => {
    if (id == null) return "";
    const entry = communeMap.get(String(id));
    if (!entry) return String(id);
    const country = entry.codepays
      ? paysMap.get(entry.codepays)?.[lang] ?? ""
      : "";
    return country ? `${entry.name}, ${country}` : entry.name;
  };

  const typeLabel = act?.typeacte
    ? typeLabels.get(act.typeacte) ?? act.typeacte
    : "";
  const communeLabel = placeLabel(act?.communeacte ?? null);
  const eventCommuneLabel = placeLabel(act?.communeevenement ?? null);
  const officerLabel =
    act?.officier != null ? officierMap.get(act.officier) ?? act.officier : "";

  const primaryNames = participants
    .slice(0, 2)
    .map((p) => `${p.nomdefamille ?? "?"} ${p.prenom ?? ""}`.trim())
    .filter(Boolean)
    .join(` ${msg(lang, "and")} `);
  const summaryParts = [
    typeLabel || act?.typeacte || null,
    act ? formatLongDate(act.dateacte, lang) : "",
    communeLabel,
  ].filter(Boolean);

  return (
    <div className="min-h-screen text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={member}
        username={user?.usager}
        pathname={`/acts/${resolvedParams.id}`}
      />
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <PageHero
          eyebrow="AGH Archives"
          title={`${msg(lang, "actDetailTitle")} #${actId}`}
          description={summaryParts.join(" • ")}
          backgroundImage={{ src: "/archives_hero.jpg", alt: "Archives background" }}
          actions={
            <div className="flex flex-wrap gap-3">
              <a
                href={buildPathWithParams({
                  pathname: "/archives",
                  preserved,
                  lang,
                })}
                className="px-5 py-3 rounded-full border border-white/70 bg-white/90 text-haiti-navy text-sm font-semibold shadow-sm hover:border-haiti-ink/30 transition"
              >
                {msg(lang, "backHome")}
              </a>
            </div>
          }
          aside={
            primaryNames ? (
              <div className="space-y-1 text-sm text-haiti-ink/80">
                <div className="text-xs uppercase tracking-[0.16em] text-haiti-ink/60">
                  {msg(lang, "actBetween")}
                </div>
                <div className="text-base font-semibold text-haiti-navy">{primaryNames}</div>
              </div>
            ) : null
          }
        />

        {!act && (
          <StatusMessage>{msg(lang, "actNotFound")}</StatusMessage>
        )}

        {act && (
          <div className="space-y-4 bg-white/85 p-5 rounded-2xl border border-white/70 shadow-card">
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-haiti-ink/85">
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "actTypeLabel")}:
                </span>{" "}
                {typeLabel || act.typeacte || "?"}
              </div>
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "actCommune")}:
                </span>{" "}
                {communeLabel || act.communeacte || "?"}
              </div>
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "actDate")}:
                </span>{" "}
                {formatLongDate(act.dateacte, lang) || "—"}
              </div>
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "eventCommune")}:
                </span>{" "}
                {eventCommuneLabel || act.communeevenement || "—"}
              </div>
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "eventDate")}:
                </span>{" "}
                {formatLongDate(act.dateevenement, lang) || "—"}
              </div>
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "officer")}:
                </span>{" "}
                {officerLabel || "—"}
              </div>
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "number")}:
                </span>{" "}
                {act.numeroacte ?? "—"}
              </div>
              <div>
                <span className="font-semibold text-haiti-ink">
                  {msg(lang, "pageNumber")}:
                </span>{" "}
                {act.pageacte ?? "—"}
              </div>
            </div>
            <div className="text-sm text-haiti-ink/85">
              <span className="font-semibold text-haiti-ink">
                {msg(lang, "actNotes")}:
              </span>{" "}
              {act.notes || "—"}
            </div>
          </div>
        )}

        {act && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-haiti-navy">
              {msg(lang, "actParticipants")}
            </h2>
            {participants.length === 0 && (
              <StatusMessage>{msg(lang, "noResults")}</StatusMessage>
            )}
            <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/85 shadow-card">
              <table className="min-w-full text-sm text-left text-haiti-ink/80">
                <thead className="bg-haiti-foam text-haiti-ink">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "roleHeader")}</th>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "lastNameHeader")}</th>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "firstNameHeader")}</th>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "age")}</th>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "birthDateHeader")}</th>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "birthPlaceHeader")}</th>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "professionHeader")}</th>
                    <th className="px-3 py-2 font-semibold">{msg(lang, "personNotes")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-haiti-ink/5">
                  {participants.map((p) => {
                    const roleLabel = p.role != null
                      ? roleLabels.get(String(p.role)) ?? p.role
                      : "";
                    const birthPlace = placeLabel(p.lieudenaissance);
                    const profession =
                      p.profession != null
                        ? metiersMap.get(p.profession) ?? p.profession
                        : "";
                    return (
                      <tr key={p.id} className="align-top">
                        <td className="px-3 py-2 text-haiti-ink/80">{roleLabel}</td>
                        <td className="px-3 py-2 font-semibold text-haiti-navy">
                          {p.nomdefamille ?? "?"}
                        </td>
                        <td className="px-3 py-2 text-haiti-ink">
                          {p.prenom ?? ""}
                        </td>
                        <td className="px-3 py-2 text-haiti-ink/80">
                          {p.age ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-haiti-ink/80">
                          {p.datedenaissance ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-haiti-ink/80">
                          {birthPlace || "—"}
                        </td>
                        <td className="px-3 py-2 text-haiti-ink/80">
                          {profession || "—"}
                        </td>
                        <td className="px-3 py-2 text-haiti-ink/80">
                          {p.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
