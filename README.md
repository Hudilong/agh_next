# AGH Next frontend

Modern Next.js app for the Association de Généalogie d'Haïti. It ships a multilingual public site, archive search, genealogy tools, and a new Genèse article experience backed by the modern `news_*` tables.

## Getting started
- Requirements: Node 18+, pnpm, and a MySQL database exposed via `DATABASE_URL` in `.env`. Set `SESSION_SECRET` to sign auth cookies (defaults to a dev secret).
- Install and run: `pnpm install` then `pnpm dev` (uses Turbopack). Build with `pnpm build`; run tests with `pnpm test`.
- Prisma targets the live schema in `prisma/schema.prisma`. A manual migration for the new news tables lives in `prisma/migrations/20240705_add_news_content.sql` (run it against MySQL before serving Genèse).

## What’s implemented
- Archives search (`/archives`): filters acts/people by name, notes, type, role, date, commune, etc.; shows paged summaries and links to detail views.
- Act detail (`/acts/[id]`): full record with officer, locations, notes, and participant grid.
- Family register (`/families`): browse surnames by letter or keyword, then list people for a family.
- Person profile (`/person/[id]`): individual sheet with identity fields plus parents, spouses, siblings, and children; links to the tree.
- Tree explorer (`/tree` + `/api/tree`): interactive ascendancy/descendancy graph built from the genealogy tables.
- Genèse (`/genese`, `/genese/[section]`, `/genese/[section]/[article]`): renders articles from the new `news_*` models with Markdown blocks, featured tags, and breadcrumbs.

## Database touchpoints (read-only)
- Stats/home: `count` for aggregate counts displayed on the landing page.
- Archives search: `personnes` joined to `actes`, with optional joins to `communes`/`pays`; lookups from `typeacte`, `role`, `communes`. Queries are limited to 20 rows per page and apply SQL `LIKE` filters based on user input (`lib/search.ts`).
- Act detail: `actes` plus related `personnes`; lookups to `typeacte`, `role`, `communes`, `pays`, `officiers`, `metiers` for human-readable labels (`app/acts/[id]/page.tsx`).
- Family register: groups `genea` by `nom` (surname) with optional letter/query filters, then fetches people for the selected family (`app/families/page.tsx`).
- Person profile: `genea` for the person; parents/children/siblings from `genea`; marriages from `genea2` to derive spouses; links back to family register and tree (`app/person/[id]/page.tsx`).
- Tree API: `/api/tree` queries `genea` (people) and `genea2` (marriages) to build nodes/edges; respects a max depth and direction and returns 401 when genealogy access is denied.
- Genèse: `news_sections` → sections, `news_articles` → article metadata/status, `news_blocks` → ordered content blocks rendered via ReactMarkdown/HTML (`app/genese/*`).
- Auth: `users` table for credentials and membership metadata (`app/actions/auth.ts`, `lib/auth.ts`).

## Auth and authorization
- Login flow: `/login` posts to the `loginAction`, which validates `usager` + `motpasse` against `users` via Prisma. On success it writes an `agh_session` httpOnly cookie containing `{ userId, issuedAt }` signed with `SESSION_SECRET` (HMAC-SHA256, 7‑day max-age). Logout deletes the cookie.
- Current user: `getCurrentUser` reads the signed cookie and fetches the matching `users` row.
- Membership tiers (`lib/auth.ts`):
  - `hasActiveSubscription` = admin flag or `expiration` in the future.
  - `getMembershipTier`: admins or membership 1/3 → `support`; membership 2 → `member`; otherwise `none`.
  - `canAccessGenealogy` allows `member` or `support`; `canAccessArchives` requires `support`.
- Gating: `/archives` always runs the query but hides act details when `canAccessArchives` is false; `/acts/[id]`, `/person/[id]`, `/tree` return a `MemberGate` for unauthorized visitors; `/api/tree` returns 401 if genealogy access is denied.

## News content model and legacy migration
- Models in `prisma/schema.prisma` + migration `prisma/migrations/20240705_add_news_content.sql`:
  - `NewsSection` (`news_sections`): `title`, unique `slug`, optional `sortOrder`, timestamps.
  - `NewsArticle` (`news_articles`): `sectionId` FK, unique `slug`, `title`, optional `subtitle`/`excerpt`/`author`, `status` enum, `publishedAt`, `isFeatured`, `legacyId` to track the origin, timestamps.
  - `NewsBlock` (`news_blocks`): ordered `position`, `type` enum (PARAGRAPH, HEADING, QUOTE, LIST, TABLE, CODE, IMAGE, HTML), `content` text, optional JSON `meta`, createdAt.
- Legacy mapping (see `docs/news-content-model.md` for the full guide):
  - `gen_rubriques` → `news_sections` (slugified names, carry `ordre` → `sortOrder`).
  - `gen_articles` → `news_articles` (`rubrique` → section FK, `premiere_page` → `isFeatured`, `afficher` → `status`, `date` → `publishedAt`, keep `id` in `legacyId`).
  - `gen_texte` → `news_blocks` (order by `ordre,id`; `sous_titre` → HEADING level 2; HTML `texte` converted to Markdown paragraphs).
- ETL script: `scripts/etl-news.js` reads the legacy `gen_*` tables, slugifies titles (ensuring uniqueness), converts HTML to Markdown with Turndown, writes to `news_*`, and records the legacy IDs for traceability. It also creates a fallback “Divers” section for articles without a rubrique.
- Client usage: `app/genese/page.tsx` lists sections with article counts; `app/genese/[section]/page.tsx` lists articles ordered by `publishedAt` (first block becomes the snippet); `app/genese/[section]/[article]/page.tsx` loads blocks ordered by `position`/`id` and renders them according to `type` (headings, paragraphs via Markdown, quotes, code, or raw HTML), showing `status` and `isFeatured` chips. Legacy `gen_*` tables remain untouched for reference.
