# News content model

This is the proposed modern replacement for the legacy `gen_*` article tables. Legacy tables stay in the database for reference; new content should be created with these tables and rendered via Markdown/structured blocks.

## Tables / Prisma models

- `NewsSection` (`news_sections`): id, title, slug (unique), sortOrder (optional), timestamps.
- `NewsArticle` (`news_articles`): id, sectionId, slug (unique), title, optional subtitle/excerpt/author, `status` (ArticleStatus), `publishedAt`, `isFeatured`, optional `legacyId` for traceability, timestamps.
- `NewsBlock` (`news_blocks`): id, articleId, position, `type` (NewsBlockType), `content` (Markdown/plain text), `meta` (JSON for list items, table rows, heading level, etc.), createdAt.
- Enums: `ArticleStatus` (DRAFT/PUBLISHED/ARCHIVED) and `NewsBlockType` (PARAGRAPH, HEADING, QUOTE, LIST, TABLE, CODE, IMAGE, HTML).

## Storage conventions

- Body content lives in `NewsBlock` rows, ordered by `position`.
- Prefer Markdown in `content` for text-oriented blocks (paragraphs, headings, quotes, lists, code). Keep styling in the renderer, not in the content.
- Use `meta` to carry structured data when needed (e.g., `{ level: 2 }` for headings, `{ items: [...] }` for lists, `{ rows: [...] }` for tables, `{ alt, src }` for images if you re-enable them later).
- Avoid inline styles/unsafe HTML; if you must ingest legacy HTML temporarily, sanitize it and tag the block as `HTML`.

## Migration hints from legacy `gen_*`

1) Map `gen_rubriques` → `NewsSection` (slugify `nom`, carry `ordre` → `sortOrder`).
2) Map `gen_articles` → `NewsArticle` (slugify `titre`, set `sectionId`, copy `titre`/`auteur`, set `legacyId` to the old `id`, set `publishedAt` from `date` when present, set `status` to PUBLISHED for visible rows).
3) Map `gen_texte` → `NewsBlock` (group by `article`, order by `ordre,id`; convert `texte` HTML to Markdown; use `sous_titre` as a heading block or prepend a heading block when present). Skip `image`/`alignement_image` unless you later wire up a new image pipeline.

## Rendering sketch

- Query `NewsArticle` with `blocks` ordered by `position`.
- For each block type, map to a React component; pass `content` through a Markdown renderer (e.g., remark/rehype) with sanitization, or use a richer editor (Slate/Tiptap) that emits the JSON you store in `meta`.
- Keep styling/layout in components and CSS, not in the stored content.
