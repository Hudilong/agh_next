import { PageHero } from "@/app/components/common/PageHero";
import { Navbar } from "@/app/components/common/Navbar";
import { StatusMessage } from "@/app/components/common/StatusMessage";
import { msg } from "@/app/i18n";
import { formatShortDate } from "@/lib/format";
import {
  buildPathWithParams,
  getPageContext,
  type SearchParamsInput,
} from "@/lib/page-params";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getGeneseCopy } from "../copy";

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: { section: string } | Promise<{ section: string }>;
  searchParams?: SearchParamsInput;
}) {
  const resolvedParams = await params;
  const { lang, preserved } = await getPageContext(searchParams);
  const copy = getGeneseCopy(lang);

  const section = await prisma.newsSection.findUnique({
    where: { slug: resolvedParams.section },
    include: {
      articles: {
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        include: {
          blocks: {
            orderBy: [{ position: "asc" }, { id: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  if (!section) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-haiti-ice/30 to-white text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={false}
        username={undefined}
        pathname={`/genese/${resolvedParams.section}`}
      />
      <main className="page-shell py-12 space-y-8 2xl:space-y-10">
        <PageHero
          eyebrow={copy.eyebrow}
          title={section.title}
          description={copy.sectionIntro(section.articles.length)}
          backgroundImage={{ src: "/home_hero.jpg", alt: "Archive library" }}
          aside={
            <div className="text-sm text-haiti-ink/80">
              {copy.heroSubtitle}
            </div>
          }
        />

        {section.articles.length === 0 ? (
          <StatusMessage className="shadow-card">
            {copy.noArticles}
          </StatusMessage>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3 2xl:gap-6">
            {section.articles.map((article) => {
              const snippet = article.blocks[0]?.content ?? "";
              return (
                <a
                  key={article.id}
                  href={buildPathWithParams({
                    pathname: `/genese/${section.slug}/${article.slug}`,
                    preserved,
                    lang,
                  })}
                  className="block rounded-2xl border border-haiti-ink/10 bg-white p-6 shadow-card hover:-translate-y-[2px] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-haiti-navy">
                        {article.title}
                      </h2>
                      {article.author && (
                        <p className="text-sm text-haiti-ink/60">
                          {copy.byAuthor(article.author)}
                        </p>
                      )}
                    </div>
                    {article.publishedAt && (
                      <span className="text-xs font-medium bg-haiti-coral/10 text-haiti-coral px-3 py-1 rounded-full shrink-0">
                        {formatShortDate(article.publishedAt, lang)}
                      </span>
                    )}
                  </div>
                  {snippet && (
                    <p className="mt-3 text-sm text-haiti-ink/70 line-clamp-3">
                      {snippet}
                    </p>
                  )}
                </a>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
