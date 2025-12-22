import type { Locale, MsgFn } from "@/app/i18n";
import { formatShortDate } from "@/lib/format";
import { buildPathWithParams } from "@/lib/page-params";
import type { ResultRow } from "@/lib/search";

export function ResultCard({
  row,
  lang,
  typeLabels,
  roleLabels,
  communeLabels,
  msg,
  canViewDetails,
  preserved,
}: {
  row: ResultRow;
  lang: Locale;
  typeLabels: Map<string, string>;
  roleLabels: Map<string, string>;
  communeLabels: Map<string, string>;
  msg: MsgFn;
  canViewDetails: boolean;
  preserved: URLSearchParams;
}) {
  const actLabel = row.typeacte
    ? typeLabels.get(row.typeacte) ?? row.typeacte
    : "?";
  const roleLabel =
    row.role != null
      ? roleLabels.get(String(row.role)) ?? String(row.role)
      : null;
  const actCommune =
    row.communeacte != null
      ? communeLabels.get(String(row.communeacte)) ?? row.communeacte
      : null;
  const birthCommune =
    row.lieudenaissance != null
      ? communeLabels.get(String(row.lieudenaissance)) ?? row.lieudenaissance
      : null;
  const detailHref = row.acteid
    ? buildPathWithParams({
        pathname: `/acts/${row.acteid}`,
        preserved,
        lang,
      })
    : null;

  const detailSection = (
    <>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-haiti-ink/90">
        <div>
          <span className="font-semibold text-haiti-ink">{msg(lang, "age")}:</span>{" "}
          {row.age ?? "n/d"}
        </div>
        <div>
          <span className="font-semibold text-haiti-ink">{msg(lang, "birth")}:</span>{" "}
          {row.datedenaissance ?? "n/d"}
          {birthCommune ? ` — ${birthCommune}` : ""}
        </div>
        {roleLabel && (
          <div>
            <span className="font-semibold text-haiti-ink">
              {msg(lang, "role")}:
            </span>{" "}
            {roleLabel}
          </div>
        )}
        {actCommune && (
          <div>
            <span className="font-semibold text-haiti-ink">
              {msg(lang, "communeAct")}:
            </span>{" "}
            {actCommune}
          </div>
        )}
      </div>
      {row.notes && (
        <div className="mt-2 text-sm text-haiti-ink/85">
          <span className="font-semibold text-haiti-ink">
            {msg(lang, "personNotes")}:
          </span>{" "}
          {row.notes}
        </div>
      )}
      {row.actenotes && (
        <div className="text-sm text-haiti-ink/85">
          <span className="font-semibold text-haiti-ink">
            {msg(lang, "actNotes")}:
          </span>{" "}
          {row.actenotes}
        </div>
      )}
    </>
  );

  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg font-semibold text-haiti-navy">
          {row.nomdefamille ?? "?"} {row.prenom ?? ""}
        </span>
        <span className="text-xs text-haiti-ink/60">#{row.id ?? "?"}</span>
        {detailHref && canViewDetails ? (
          <a
            href={detailHref}
            className="md:ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-haiti-coral to-haiti-sky text-white text-xs px-4 py-2 font-semibold shadow-lg shadow-haiti-coral/30 hover:translate-y-[1px] transition"
          >
            {actLabel}
            <span className="opacity-80">
              #{row.acteid ?? "?"} {formatShortDate(row.dateacte, lang)}
              </span>
            </a>
          ) : (
          <span className="md:ml-auto inline-flex items-center gap-2 rounded-full bg-haiti-foam text-haiti-ink text-xs px-4 py-2 font-semibold">
            {actLabel}
            <span className="opacity-80">
              #{row.acteid ?? "?"} {formatShortDate(row.dateacte, lang)}
            </span>
          </span>
        )}
      </div>
      {canViewDetails ? (
        <>
          <div className="hidden sm:block">
            {detailSection}
          </div>
          <details className="sm:hidden mt-3 group rounded-xl border border-haiti-ink/10 bg-haiti-foam/40 px-3 py-2">
            <summary className="flex items-center justify-between text-sm font-semibold text-haiti-navy cursor-pointer select-none">
              <span className="group-open:hidden">{msg(lang, "viewDetails")}</span>
              <span className="hidden group-open:inline">{msg(lang, "hideDetails")}</span>
              <span className="text-xs text-haiti-ink/60">▾</span>
            </summary>
            <div className="pt-2 text-sm text-haiti-ink/90 space-y-2">
              {detailSection}
            </div>
          </details>
        </>
      ) : (
        <div className="mt-3 text-sm text-haiti-ink/70">
          {msg(lang, "supportOnly")}
        </div>
      )}
    </div>
  );
}
