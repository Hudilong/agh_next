import { PageHero } from "@/app/components/common/PageHero";
import { Navbar } from "@/app/components/common/Navbar";
import { msg } from "@/app/i18n";
import { formatLongDate } from "@/lib/format";
import {
  buildPathWithParams,
  getPageContext,
  type SearchParamsInput,
} from "@/lib/page-params";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { getGeneseCopy } from "../../copy";

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: { section: string; article: string } | Promise<{ section: string; article: string }>;
  searchParams?: SearchParamsInput;
}) {
  const resolvedParams = await params;
  const { lang, preserved } = await getPageContext(searchParams);
  const copy = getGeneseCopy(lang);
  const breadcrumbRoot = msg(lang, "geneseBreadcrumbRoot");

  const section = await prisma.newsSection.findUnique({
    where: { slug: resolvedParams.section },
    select: { id: true, title: true, slug: true },
  });
  if (!section) {
    notFound();
  }

  const article = await prisma.newsArticle.findFirst({
    where: { slug: resolvedParams.article, sectionId: section.id },
    include: {
      blocks: {
        orderBy: [{ position: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!article) {
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
        pathname={`/genese/${section.slug}/${article.slug}`}
      />
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <PageHero
          eyebrow={`${breadcrumbRoot} · ${section.title}`}
          title={article.title}
          description={[
            article.author ? copy.byAuthor(article.author) : null,
            article.publishedAt
              ? copy.publishedOn(formatLongDate(article.publishedAt, lang))
              : null,
          ]
            .filter(Boolean)
            .join(" • ")}
          backgroundImage={{ src: "/home_hero2.jpg", alt: "Historic journal illustration" }}
          actions={
            <div className="flex flex-wrap gap-3">
              <a
                href={buildPathWithParams({
                  pathname: "/genese",
                  preserved,
                  lang,
                })}
                className="text-sm px-4 py-2 rounded-full border border-white/70 bg-white/80 text-haiti-ink font-semibold hover:border-haiti-ink/30 transition"
              >
                {breadcrumbRoot}
              </a>
              <a
                href={buildPathWithParams({
                  pathname: `/genese/${section.slug}`,
                  preserved,
                  lang,
                })}
                className="text-sm px-4 py-2 rounded-full border border-white/70 bg-white/80 text-haiti-ink font-semibold hover:border-haiti-ink/30 transition"
              >
                {section.title}
              </a>
            </div>
          }
          aside={
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-haiti-sky/10 text-haiti-sky text-xs font-semibold">
                {article.status}
              </span>
              {article.isFeatured && (
                <span className="px-3 py-1 rounded-full bg-haiti-coral/10 text-haiti-coral text-xs font-semibold">
                  {copy.featured}
                </span>
              )}
            </div>
          }
        />

        <article className="prose prose-haiti max-w-none">
          {article.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </article>
      </main>
    </div>
  );
}

type ArticleBlock = {
  id: number;
  type: string;
  content: string | null;
  meta: Record<string, unknown> | null;
};

function BlockRenderer({ block }: { block: ArticleBlock }) {
  const meta = block.meta ?? {};
  switch (block.type) {
    case "HEADING": {
      const level = Math.min(
        6,
        Math.max(2, Number(meta.level) || 2),
      ) as 1 | 2 | 3 | 4 | 5 | 6;
      const Tag = `h${level}` as const;
      return <Tag>{block.content}</Tag>;
    }
    case "PARAGRAPH":
      return (
        <div className="prose max-w-none">
          <ReactMarkdown>{block.content ?? ""}</ReactMarkdown>
        </div>
      );
    case "QUOTE":
      return (
        <blockquote className="border-l-4 border-haiti-sky pl-4 italic text-haiti-ink/80">
          {block.content}
        </blockquote>
      );
    case "CODE":
      return (
        <pre className="bg-haiti-ink/5 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{block.content}</code>
        </pre>
      );
    case "HTML":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: block.content ?? "" }}
        />
      );
    default:
      return (
        <div className="prose max-w-none">
          <ReactMarkdown>{block.content ?? ""}</ReactMarkdown>
        </div>
      );
  }
}
