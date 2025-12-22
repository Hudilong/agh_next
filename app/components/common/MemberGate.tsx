import { PageHero } from "@/app/components/common/PageHero";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import type { Locale, MsgFn } from "@/app/i18n";
import { buildPathWithParams } from "@/lib/page-params";

export function MemberGate({
  lang,
  preserved,
  msg,
  title,
  eyebrow = "AGH",
  description,
  backHref = "/",
}: {
  lang: Locale;
  preserved: URLSearchParams;
  msg: MsgFn;
  title: string;
  eyebrow?: string;
  description?: string;
  backHref?: string;
}) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description ?? msg(lang, "memberRequired")}
        backgroundImage={{ src: "/archives_hero.jpg", alt: "Archives background" }}
        actions={
          <div className="flex flex-wrap gap-3">
            <a
              href={buildPathWithParams({
                pathname: "/login",
                preserved,
                lang,
              })}
              className="px-5 py-3 rounded-full bg-gradient-to-r from-haiti-coral to-haiti-sky text-white text-sm font-semibold shadow-lg shadow-haiti-coral/30 hover:translate-y-[1px] transition"
            >
              {msg(lang, "navLogin")}
            </a>
            <a
              href={buildPathWithParams({
                pathname: backHref,
                preserved,
                lang,
              })}
              className="px-5 py-3 rounded-full border border-white/70 bg-white/85 text-haiti-navy text-sm font-semibold shadow-sm hover:border-haiti-ink/30 transition"
            >
              {msg(lang, "backHome")}
            </a>
          </div>
        }
      />
      <StatusMessage>{description ?? msg(lang, "memberRequired")}</StatusMessage>
    </>
  );
}
