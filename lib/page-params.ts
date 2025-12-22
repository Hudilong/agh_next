import { notFound } from "next/navigation";

import { normalizeLang, type Locale } from "@/app/i18n";

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;
export type SearchParamsInput =
  | Promise<SearchParamsRecord | undefined>
  | SearchParamsRecord
  | undefined;

export async function resolveSearchParams(
  searchParams?: SearchParamsInput,
): Promise<SearchParamsRecord> {
  const resolved = await searchParams;
  return resolved ?? {};
}

export function firstParam(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveLang(params: SearchParamsRecord): Locale {
  return normalizeLang(firstParam(params.lang));
}

export function buildPreservedParams(params: SearchParamsRecord): URLSearchParams {
  const preserved = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === "lang" || value == null) return;
    if (Array.isArray(value)) {
      if (value[0]) preserved.set(key, value[0]);
    } else if (value) {
      preserved.set(key, value);
    }
  });
  return preserved;
}

export async function getPageContext(searchParams?: SearchParamsInput) {
  const params = await resolveSearchParams(searchParams);
  const lang = resolveLang(params);
  const preserved = buildPreservedParams(params);
  return { params, lang, preserved };
}

export function parseIdOrNotFound(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(parsed)) {
    notFound();
  }
  return parsed;
}

export function buildPathWithParams({
  pathname,
  preserved,
  lang,
  params,
}: {
  pathname: string;
  preserved: URLSearchParams;
  lang?: string;
  params?: Record<string, string | number | null | undefined>;
}) {
  const qs = new URLSearchParams(preserved);
  if (lang) qs.set("lang", lang);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value == null) return;
      qs.set(key, String(value));
    });
  }
  const query = qs.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildPreservedForLink(
  pathname: string,
  preserved: URLSearchParams = new URLSearchParams(),
  options?: {
    lang?: string;
    params?: Record<string, string | number | null | undefined>;
  },
) {
  return buildPathWithParams({
    pathname,
    preserved,
    lang: options?.lang,
    params: options?.params,
  });
}

export function parseOptionalNumber(raw: string | undefined | null): number | null {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isNaN(parsed) ? null : parsed;
}
