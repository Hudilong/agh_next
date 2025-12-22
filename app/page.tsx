import { Navbar } from "@/app/components/common/Navbar";
import { StatCard } from "@/app/components/common/StatCard";
import { CtaButtons } from "@/app/components/common/CtaButtons";
import { PageHero } from "@/app/components/common/PageHero";
import { Chip } from "@/app/components/common/Chip";
import { msg, type Locale } from "@/app/i18n";
import { getCurrentUser, isMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildPreservedForLink,
  getPageContext,
  type SearchParamsInput,
} from "@/lib/page-params";

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const { lang, preserved } = await getPageContext(searchParams);
  const user = await getCurrentUser();
  const member = isMember(user);
  const archiveHref = buildPreservedForLink("/archives", undefined, { lang });
  const loginHref = buildPreservedForLink("/login", undefined, { lang });
  const geneseHref = buildPreservedForLink("/genese", undefined, { lang });

  const counts =
    (await prisma.count.findFirst({
      select: {
        actes: true,
        personnes: true,
        genea: true,
        genea2: true,
        rois: true,
      },
    })) ?? {};

  const cards = [
    { label: msg(lang, "statsActes"), value: counts.actes ?? 0 },
    { label: msg(lang, "statsPersonnes"), value: counts.personnes ?? 0 },
    { label: msg(lang, "statsGenea"), value: counts.genea ?? 0 },
    { label: msg(lang, "statsFamilles"), value: counts.genea2 ?? 0 },
    { label: msg(lang, "statsRois"), value: counts.rois ?? 0 },
  ];

  return (
    <div className="min-h-screen text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={member}
        username={user?.usager}
        pathname="/"
      />
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <PageHero
          eyebrow="AGH"
          title={msg(lang, "homeHeroTitle")}
          description={msg(lang, "homeHeroSubtitle")}
          backgroundImage={{ src: "/home_hero.jpg", alt: "Historic Haitian landscape" }}
          actions={
            <CtaButtons
              primaryLabel={msg(lang, "searchCta")}
              primaryHref={archiveHref}
              secondaryLabel={msg(lang, "loginCta")}
              secondaryHref={loginHref}
            />
          }
          aside={
            <div className="space-y-3">
              <div className="text-base font-semibold text-haiti-navy">
                {msg(lang, "heroTitle")}
              </div>
              <p className="text-sm text-haiti-ink/75">
                {msg(lang, "heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-2">
                {[msg(lang, "navSearch"), msg(lang, "navFamilies"), msg(lang, "navTree")].map(
                  (label) => (
                    <Chip key={label} label={label} />
                  ),
                )}
              </div>
            </div>
          }
        />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <StatCard key={c.label} label={c.label} value={c.value} />
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card
            title={msg(lang, "navSearch")}
            body={msg(lang, "heroSubtitle")}
            href={archiveHref}
            lang={lang}
          />
          <Card
            title={msg(lang, "loginCta")}
            body={msg(lang, "memberOnly")}
            href={loginHref}
            lang={lang}
          />
          <Card
            title={msg(lang, "homeGeneseTitle")}
            body={msg(lang, "homeGeneseSubtitle")}
            href={geneseHref}
            lang={lang}
          />
        </section>
      </main>
    </div>
  );
}

function Card({
  title,
  body,
  href,
  lang,
}: {
  title: string;
  body: string;
  href: string;
  lang: Locale;
}) {
  const cta = msg(lang, "ctaDiscover");
  return (
    <a
      href={href}
      className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-card hover:-translate-y-[2px] transition"
    >
      <div className="text-base font-semibold text-haiti-navy">{title}</div>
      <p className="mt-2 text-sm text-haiti-ink/80">{body}</p>
      <div className="mt-4 text-xs uppercase tracking-[0.1em] text-haiti-ink/60">
        {cta}
      </div>
    </a>
  );
}
