import type { Locale, MsgFn } from "@/app/i18n";
import { buildPathWithParams } from "@/lib/page-params";

export function Pagination({
  lang,
  preserved,
  page,
  pageSize,
  total,
  msg,
}: {
  lang: Locale;
  preserved: URLSearchParams;
  page: number;
  pageSize: number;
  total: number;
  msg: MsgFn;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const buildHref = (p: number) =>
    buildPathWithParams({
      pathname: "/archives",
      preserved,
      lang,
      params: { page: p },
    });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 text-sm text-haiti-ink/80">
      <span className="order-2 sm:order-1">
        {msg(lang, "pageLabel")} {page} {msg(lang, "ofLabel")} {totalPages}
      </span>
      <div className="flex gap-2 order-1 sm:order-2">
        <a
          href={prev ? buildHref(prev) : "#"}
          aria-disabled={!prev}
          className={`px-4 py-2 rounded-full border ${
            prev
              ? "border-haiti-ink/15 text-haiti-ink hover:border-haiti-ink/40"
              : "border-haiti-ink/10 text-haiti-ink/30 pointer-events-none"
          }`}
        >
          {msg(lang, "paginationPrev")}
        </a>
        <a
          href={next ? buildHref(next) : "#"}
          aria-disabled={!next}
          className={`px-4 py-2 rounded-full border ${
            next
              ? "border-transparent bg-gradient-to-r from-haiti-coral to-haiti-sky text-white shadow-lg shadow-haiti-coral/25"
              : "border-haiti-ink/10 text-haiti-ink/30 pointer-events-none"
          }`}
        >
          {msg(lang, "paginationNext")}
        </a>
      </div>
    </div>
  );
}
