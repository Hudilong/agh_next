import type { Locale, MsgFn } from "@/app/i18n";
import type { QueryResult, SearchParams } from "@/lib/search";
import { hasFilters } from "@/lib/search";
import { ResultCard } from "./ResultCard";
import { Pagination } from "./Pagination";
import { StatusMessage } from "@/app/components/common/StatusMessage";

export function ResultsSection({
  lang,
  params,
  results,
  preserved,
  msg,
  typeLabels,
  roleLabels,
  communeLabels,
  canViewDetails,
}: {
  lang: Locale;
  params: SearchParams;
  results: QueryResult;
  preserved: URLSearchParams;
  msg: MsgFn;
  typeLabels: Map<string, string>;
  roleLabels: Map<string, string>;
  communeLabels: Map<string, string>;
  canViewDetails: boolean;
}) {
  const start =
    results.total === 0 ? 0 : (results.page - 1) * results.pageSize + 1;
  const end = Math.min(results.total, results.page * results.pageSize);

  return (
    <section className="glass-panel rounded-2xl p-7 space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-haiti-navy">
            {msg(lang, "resultsCount")}{" "}
            {results.total > 0 ? `${start}-${end}/${results.total}` : ""}
          </h2>
          <p className="text-xs text-haiti-ink/70">{msg(lang, "limitNotice")}</p>
        </div>
        <div className="pill bg-haiti-foam text-haiti-navy border-transparent">
          {results.total} {msg(lang, "results")}
        </div>
      </div>
      {!hasFilters(params) && (
        <StatusMessage>{msg(lang, "noFilters")}</StatusMessage>
      )}
      {hasFilters(params) && results.total === 0 && (
        <StatusMessage>{msg(lang, "noResults")}</StatusMessage>
      )}
      {results.total > 0 && (
        <div className="space-y-3">
          {results.rows.map((row) => (
            <ResultCard
              key={`${row.id}-${row.acteid}`}
              row={row}
              lang={lang}
              typeLabels={typeLabels}
              roleLabels={roleLabels}
              communeLabels={communeLabels}
              msg={msg}
              canViewDetails={canViewDetails}
              preserved={preserved}
            />
          ))}
        </div>
      )}
      {results.total > results.pageSize && (
        <Pagination
          lang={lang}
          preserved={preserved}
          page={results.page}
          pageSize={results.pageSize}
          total={results.total}
          msg={msg}
        />
      )}
    </section>
  );
}
