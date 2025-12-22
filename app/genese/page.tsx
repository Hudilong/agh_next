import { PageHero } from "@/app/components/common/PageHero";
import { Navbar } from "@/app/components/common/Navbar";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import { msg } from "@/app/i18n";
import {
  buildPathWithParams,
  getPageContext,
  type SearchParamsInput,
} from "@/lib/page-params";
import { prisma } from "@/lib/prisma";
import { getGeneseCopy } from "./copy";

export default async function GenesePage({
  searchParams,
}: {
  searchParams?: SearchParamsInput;
}) {
  const { lang, preserved } = await getPageContext(searchParams);
  const copy = getGeneseCopy(lang);

  const sections = await prisma.newsSection.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-haiti-ice/30 to-white text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={false}
        username={undefined}
        pathname="/genese"
      />
      <main className="page-shell py-12 space-y-8 2xl:space-y-10">
        <PageHero
          eyebrow={copy.eyebrow}
          title={msg(lang, "geneseHeroTitle")}
          description={msg(lang, "geneseHeroSubtitle")}
          backgroundImage={{ src: "/home_hero.jpg", alt: "Archive library" }}
          aside={
            <div className="space-y-2 text-sm text-haiti-ink/80">
              {copy.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          }
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
          {sections.map((section) => (
            <a
              key={section.id}
              href={buildPathWithParams({
                pathname: `/genese/${section.slug}`,
                preserved,
                lang,
              })}
              className="rounded-2xl border border-haiti-ink/10 bg-white shadow-card hover:-translate-y-[2px] transition p-6 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-haiti-navy">
                  {section.title}
                </h2>
                <span className="text-xs font-medium bg-haiti-sky/10 text-haiti-sky px-3 py-1 rounded-full">
                  {copy.articleCountBadge(section._count.articles)}
                </span>
              </div>
            </a>
          ))}
          {sections.length === 0 && (
            <StatusMessage className="shadow-card">
              {copy.emptySections}
            </StatusMessage>
          )}
        </section>
      </main>
    </div>
  );
}
