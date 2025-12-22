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
  const links = [
    {
      label: msg(lang, "navSearch"),
      href: buildPathWithParams({ pathname: "/archives", preserved, lang }),
    },
    {
      label: msg(lang, "navFamilies"),
      href: buildPathWithParams({ pathname: "/families", preserved, lang }),
    },
    {
      label: msg(lang, "navGenese"),
      href: buildPathWithParams({ pathname: "/genese", preserved, lang }),
    },
  ];

  return (
    <nav className="sticky top-0 z-30 border-b border-white/40 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="page-shell py-3 sm:py-4 flex items-center gap-4 md:gap-6 lg:gap-7">
        <Link
          href={buildPathWithParams({ pathname: "/", preserved, lang })}
          className="flex items-center gap-2 sm:gap-3 text-haiti-navy shrink-0"
        >
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-haiti-navy via-haiti-sky to-haiti-coral text-white flex items-center justify-center font-black shadow-card text-base sm:text-lg">
            AGH
          </span>
          <div className="leading-tight">
            <div className="text-sm sm:text-base md:text-lg font-semibold">
              {msg(lang, "siteTitle")}
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-haiti-ink/80 hover:text-haiti-ink font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden md:flex items-center gap-3 lg:gap-4">
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

        <details className="ml-auto md:hidden relative">
          <summary className="flex items-center gap-2 rounded-full border border-haiti-ink/15 bg-white/90 px-3 py-2 text-sm font-semibold text-haiti-ink cursor-pointer select-none shadow-sm list-none">
            <span className="text-xs">Menu</span>
            <span className="flex flex-col gap-[3px]">
              <span className="block h-[2px] w-4 rounded bg-haiti-ink/80" />
              <span className="block h-[2px] w-4 rounded bg-haiti-ink/80" />
              <span className="block h-[2px] w-4 rounded bg-haiti-ink/80" />
            </span>
          </summary>
          <div className="absolute right-0 mt-3 w-[min(90vw,320px)] rounded-2xl border border-haiti-ink/10 bg-white shadow-card overflow-visible z-40">
            <div className="flex flex-col divide-y divide-haiti-ink/5">
              <div className="p-3 space-y-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-haiti-navy hover:bg-haiti-foam/70"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="p-3 space-y-2">
                {isMember && (
                  <Chip label={msg(lang, "memberBadge")} size="sm" active />
                )}
                {username ? (
                  <form action={logoutAction}>
                    <input type="hidden" name="lang" value={lang} />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-haiti-ink/15 bg-white px-4 py-2 text-sm font-semibold text-haiti-ink hover:border-haiti-ink/40"
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
                    className="block text-center rounded-full border border-haiti-ink/15 bg-white px-4 py-2 text-sm font-semibold text-haiti-ink hover:border-haiti-ink/40"
                  >
                    {msg(lang, "navLogin")}
                  </Link>
                )}
              </div>
              <div className="p-3">
                <LanguageToggle
                  lang={lang}
                  preserved={preserved}
                  pathname={pathname}
                  inline
                />
              </div>
            </div>
          </div>
        </details>
      </div>
    </nav>
  );
}
