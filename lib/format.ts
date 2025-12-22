import type { Locale } from "@/app/i18n";

const MONTHS: Record<Locale, string[]> = {
  fr: [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  es: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  ht: [
    "janvye",
    "fevriye",
    "mas",
    "avril",
    "me",
    "jen",
    "jiyè",
    "out",
    "septanm",
    "oktòb",
    "novanm",
    "desanm",
  ],
};

const LOCALE_MAP: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  ht: "ht-HT",
};

type DateInput = Date | string | null | undefined;

function parseDate(input: DateInput): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const parts = input.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const year = Number.parseInt(y, 10);
    const monthIndex = Number.parseInt(m, 10) - 1;
    const day = Number.parseInt(d, 10);
    if (
      !Number.isNaN(year) &&
      !Number.isNaN(monthIndex) &&
      monthIndex >= 0 &&
      monthIndex < 12 &&
      !Number.isNaN(day)
    ) {
      const constructed = new Date(Date.UTC(year, monthIndex, day));
      return Number.isNaN(constructed.getTime()) ? null : constructed;
    }
  }
  return null;
}

function fallbackFromString(input: string, lang: Locale): string {
  const parts = input.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const mi = Number.parseInt(m, 10) - 1;
    const di = Number.parseInt(d, 10);
    if (!Number.isNaN(mi) && mi >= 0 && mi < 12 && !Number.isNaN(di)) {
      return `${di} ${MONTHS[lang][mi]} ${y}`;
    }
  }
  return input;
}

function formatDate(
  input: DateInput,
  lang: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  const parsed = parseDate(input);
  if (parsed) {
    return parsed.toLocaleDateString(LOCALE_MAP[lang], options);
  }
  if (typeof input === "string") {
    return fallbackFromString(input, lang);
  }
  return "";
}

export function formatLongDate(input: DateInput, lang: Locale): string {
  return formatDate(input, lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(input: DateInput, lang: Locale): string {
  return formatDate(input, lang, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
