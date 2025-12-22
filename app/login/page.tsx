import { Navbar } from "@/app/components/common/Navbar";
import { PageHero } from "@/app/components/common/PageHero";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import { msg } from "@/app/i18n";
import { getCurrentUser, isMember } from "@/lib/auth";
import {
  buildPathWithParams,
  getPageContext,
  type SearchParamsInput,
} from "@/lib/page-params";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const { lang, preserved } = await getPageContext(searchParams);
  const user = await getCurrentUser();
  const copy = {
    loginError: msg(lang, "loginError"),
    username: msg(lang, "username"),
    password: msg(lang, "password"),
    loginCta: msg(lang, "loginCta"),
  };

  return (
    <div className="min-h-screen text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={isMember(user)}
        username={user?.usager}
        pathname="/login"
      />
      <main className="page-shell py-12 space-y-8 2xl:space-y-10">
        <PageHero
          eyebrow={msg(lang, "navLogin")}
          title={msg(lang, "loginTitle")}
          description={msg(lang, "loginIntro")}
          backgroundImage={{ src: "/home_hero2.jpg", alt: "Historic library shelves" }}
          actions={
            user ? (
              <a
                href={buildPathWithParams({
                  pathname: "/archives",
                  preserved,
                  lang,
                })}
                className="px-5 py-3 rounded-full bg-gradient-to-r from-haiti-coral to-haiti-sky text-white text-sm font-semibold shadow-lg shadow-haiti-coral/30 hover:translate-y-[1px] transition"
              >
                {msg(lang, "backHome")}
              </a>
            ) : null
          }
        />
        {user ? (
          <div className="space-y-3">
            <StatusMessage>
              {msg(lang, "memberOnly")}
            </StatusMessage>
            <a
              href={buildPathWithParams({
                pathname: "/archives",
                preserved,
                lang,
              })}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-haiti-ink/15 text-haiti-ink hover:border-haiti-ink/40"
            >
              {msg(lang, "backHome")}
            </a>
          </div>
        ) : (
          <LoginForm lang={lang} copy={copy} />
        )}
      </main>
    </div>
  );
}
