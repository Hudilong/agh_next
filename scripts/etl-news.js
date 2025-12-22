// ETL script to migrate legacy gen_* content into the new news_* tables.
// Usage: node scripts/etl-news.js

const { PrismaClient } = require('@prisma/client');
const slugify = require('slugify');
const TurndownService = require('turndown');

const prisma = new PrismaClient();
const turndown = new TurndownService();

function uniqueSlug(base, used) {
  const clean = slugify(base || '', { lower: true, strict: true }) || 'item';
  let slug = clean;
  let i = 2;
  while (used.has(slug)) {
    slug = `${clean}-${i}`;
    i += 1;
  }
  used.add(slug);
  return slug;
}

function htmlToMarkdown(html) {
  if (!html) return '';
  try {
    return turndown.turndown(html);
  } catch {
    return html;
  }
}

async function main() {
  const slugSetSections = new Set();
  const slugSetArticles = new Set();
  const sectionIdByLegacy = new Map();

  console.log('Loading rubriques...');
  const rubriques = await prisma.gen_rubriques.findMany();

  for (const r of rubriques) {
    const slug = uniqueSlug(r.nom || `section-${r.id}`, slugSetSections);
    const section = await prisma.newsSection.create({
      data: {
        title: r.nom || 'Sans titre',
        slug,
        sortOrder: r.ordre ?? null,
      },
    });
    sectionIdByLegacy.set(r.id, section.id);
  }

  // Fallback section for articles without a rubrique.
  const miscSection = await prisma.newsSection.create({
    data: {
      title: 'Divers',
      slug: uniqueSlug('divers', slugSetSections),
      sortOrder: null,
    },
  });

  console.log('Loading articles...');
  const articles = await prisma.gen_articles.findMany();

  for (const a of articles) {
    const sectionId =
      (a.rubrique && sectionIdByLegacy.get(a.rubrique)) || miscSection.id;
    const slug = uniqueSlug(a.titre || `article-${a.id}`, slugSetArticles);
    const newsArticle = await prisma.newsArticle.create({
      data: {
        sectionId,
        slug,
        title: a.titre || 'Sans titre',
        subtitle: null,
        excerpt: null,
        author: a.auteur || null,
        status: a.afficher === 1 ? 'PUBLISHED' : 'DRAFT',
        publishedAt: a.date || null,
        isFeatured: a.premiere_page === 1,
        legacyId: a.id,
      },
    });

    const textes = await prisma.gen_texte.findMany({
      where: { article: a.id },
      orderBy: [{ ordre: 'asc' }, { id: 'asc' }],
    });

    const blocks = [];
    let position = 0;

    for (const t of textes) {
      if (t.sous_titre) {
        blocks.push({
          articleId: newsArticle.id,
          position: position++,
          type: 'HEADING',
          content: t.sous_titre,
          meta: { level: 2 },
        });
      }
      if (t.texte) {
        blocks.push({
          articleId: newsArticle.id,
          position: position++,
          type: 'PARAGRAPH',
          content: htmlToMarkdown(t.texte),
          meta: null,
        });
      }
    }

    if (blocks.length) {
      await prisma.newsBlock.createMany({ data: blocks });
    }
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
