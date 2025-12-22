"use client";

import { msg, type Locale } from "@/app/i18n";
import { buildPreservedForLink } from "@/lib/page-params";
import { toStr, type Lookups, type SearchParams } from "@/lib/search";

export function FiltersForm({
  lang,
  params,
  lookups,
}: {
  lang: Locale;
  params: SearchParams;
  lookups: Lookups;
}) {
  const sort = toStr(params.sort) || "name_asc";
  return (
    <form
      id="filters"
      method="get"
      className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 bg-white/85 p-6 md:p-7 2xl:p-8 rounded-2xl shadow-card border border-white/70 backdrop-blur"
    >
      <input type="hidden" name="lang" value={lang} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "lastName")}
        </span>
        <input
          name="nom"
          defaultValue={toStr(params.nom)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-haiti-foam/60 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
          placeholder="ex: jean"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "firstName")}
        </span>
        <input
          name="prenom"
          defaultValue={toStr(params.prenom)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-haiti-foam/60 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
          placeholder="ex: pierre"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "actType")}
        </span>
        <select
          name="typeacte"
          defaultValue={toStr(params.typeacte)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
        >
          <option value="">{msg(lang, "reset")}</option>
          {lookups.typeacte.map((t) => (
            <option key={t.code} value={t.code}>
              {t.nom ?? t.code}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">{msg(lang, "role")}</span>
        <select
          name="role"
          defaultValue={toStr(params.role)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
        >
          <option value="">{msg(lang, "reset")}</option>
          {lookups.roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.role ?? r.id}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "yearMin")}
        </span>
        <input
          name="dtmin"
          defaultValue={toStr(params.dtmin)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-haiti-foam/60 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
          placeholder="ex: 1800"
          inputMode="numeric"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "yearMax")}
        </span>
        <input
          name="dtmax"
          defaultValue={toStr(params.dtmax)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-haiti-foam/60 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
          placeholder="ex: 1820"
          inputMode="numeric"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-3 lg:col-span-1">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "notes")}
        </span>
        <input
          name="notes"
          defaultValue={toStr(params.notes)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-haiti-foam/60 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
          placeholder="mot-clé (personnes ou actes)"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "sortLabel")}
        </span>
        <select
          name="sort"
          defaultValue={sort}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
        >
          <option value="name_asc">{msg(lang, "sortNameAsc")}</option>
          <option value="name_desc">{msg(lang, "sortNameDesc")}</option>
          <option value="date_asc">{msg(lang, "sortDateAsc")}</option>
          <option value="date_desc">{msg(lang, "sortDateDesc")}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "searchMode")}
        </span>
        <select
          name="mode"
          defaultValue={toStr(params.mode) || "d"}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
        >
          <option value="d">{msg(lang, "searchModeStarts")}</option>
          <option value="i">{msg(lang, "searchModeContains")}</option>
          <option value="e">{msg(lang, "searchModeExact")}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "communeBirth")}
        </span>
        <input
          name="ville"
          defaultValue={toStr(params.ville)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-haiti-foam/60 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
          placeholder="ex: Jacmel"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "paysBirth")}
        </span>
        <input
          name="pays"
          defaultValue={toStr(params.pays)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-haiti-foam/60 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
          placeholder="ex: Haiti"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">
          {msg(lang, "communeAct")}
        </span>
        <select
          name="comacte"
          defaultValue={toStr(params.comacte)}
          className="border border-haiti-ink/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
        >
          <option value="">{msg(lang, "reset")}</option>
          {lookups.communes.map((c, idx) => (
            <option key={`${c.id ?? "commune"}-${idx}`} value={c.id ?? ""}>
              {c.commune ?? c.id}
            </option>
          ))}
        </select>
      </label>
      <div className="md:col-span-3 lg:col-span-1 flex gap-3">
        <button
          type="submit"
          className="bg-gradient-to-r from-haiti-coral to-haiti-sky text-white px-5 py-3 rounded-full font-semibold shadow-lg shadow-haiti-coral/30 hover:translate-y-[1px] transition"
        >
          {msg(lang, "searchCta")}
        </button>
        <a
          href={buildPreservedForLink("/archives", undefined, { lang })}
          className="px-5 py-3 rounded-full border border-haiti-ink/15 text-haiti-ink font-semibold hover:border-haiti-ink/40 transition"
        >
          {msg(lang, "reset")}
        </a>
      </div>
    </form>
  );
}
