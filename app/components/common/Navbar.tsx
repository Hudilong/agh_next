import Link from "next/link";
import { LanguageToggle } from "./LanguageToggle";
import { Chip } from "./Chip";
import type { Locale, MsgFn } from "@/app/i18n";
import { logoutAction } from "@/app/actions/auth";
import { buildPathWithParams } from "@/lib/page-params";

export function Navbar({
  lang,
  preserved,
  msg,
  isMember,
  username,
  pathname = "/",
}: {
  lang: Locale;
  preserved: URLSearchParams;
  msg: MsgFn;
  isMember: boolean;
  username?: string | null;
  pathname?: string;
}) {
  return (
    <nav className="sticky top-0 z-30 border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-5">
        <Link
          href={buildPathWithParams({ pathname: "/", preserved, lang })}
          className="flex items-center gap-3 text-haiti-navy"
        >
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-haiti-navy via-haiti-sky to-haiti-coral text-white flex items-center justify-center font-black shadow-card">
            AGH
          </span>
          <div className="leading-tight">
            <div className="text-base md:text-lg font-semibold">
              {msg(lang, "siteTitle")}
            </div>
          </div>
        </Link>
        <Link
          href={buildPathWithParams({
            pathname: "/archives",
            preserved,
            lang,
          })}
          className="text-sm text-haiti-ink/80 hover:text-haiti-ink font-medium"
        >
          {msg(lang, "navSearch")}
        </Link>
        <Link
          href={buildPathWithParams({
            pathname: "/families",
            preserved,
            lang,
          })}
          className="text-sm text-haiti-ink/80 hover:text-haiti-ink font-medium"
        >
          {msg(lang, "navFamilies")}
        </Link>
        <Link
          href={buildPathWithParams({
            pathname: "/genese",
            preserved,
            lang,
          })}
          className="text-sm text-haiti-ink/80 hover:text-haiti-ink font-medium"
        >
          {msg(lang, "navGenese")}
        </Link>
        <div className="ml-auto flex items-center gap-3">
          {isMember && <Chip label={msg(lang, "memberBadge")} size="sm" active />}
          {username ? (
            <form action={logoutAction} className="inline">
              <input type="hidden" name="lang" value={lang} />
              <button
                type="submit"
                className="text-sm px-4 py-2 rounded-full border border-haiti-ink/15 text-haiti-ink font-semibold hover:border-haiti-ink/40 transition"
              >
                {msg(lang, "navLogout")}
              </button>
            </form>
          ) : (
            <Link
              href={buildPathWithParams({
                pathname: "/login",
                preserved,
                lang,
              })}
              className="text-sm px-4 py-2 rounded-full border border-haiti-ink/15 text-haiti-ink font-semibold hover:border-haiti-ink/40 transition"
            >
              {msg(lang, "navLogin")}
            </Link>
          )}
          <LanguageToggle
            lang={lang}
            preserved={preserved}
            pathname={pathname}
          />
        </div>
      </div>
    </nav>
  );
}
