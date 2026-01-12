# AGH frontend blueprint

## Goals
- Multilingual public site (fr/en/es/ht) with archives search, person/tree explorers, and Genèse articles.
- Admin experience to manage Genèse sections/articles with a block-based editor and safe media handling.
- Paid memberships/subscriptions (Stripe + PayPal) with automated access control and social login support.

## Stack and conventions
- Next.js 15 app router + TypeScript (strict), TailwindCSS; prefer server components; client components only when needed (forms, editor, XYFlow).
- Prisma/MySQL for all data (`users`, `news_*`, `genea`, `genea2`, `actes`/`personnes`, billing tables).
- Keep URL params and `lang` preservation via existing helpers; reuse `lib/prisma.ts` singleton and parameterized raw queries.

## Authentication and identity
- Use Auth.js/NextAuth with a Credentials provider (existing `users` rows) plus social login (e.g., Google/Microsoft; add more providers as needed). Store passwords hashed (bcrypt/scrypt) and require `SESSION_SECRET` in prod.
- Sessions: httpOnly/secure/sameSite=lax cookies; rotation/CSRF handled by Auth.js; prefer database sessions to allow revocation and device tracking. Short-lived (7–14d) sessions with idle rotation.
- Account linking: match OAuth logins by verified email; if a `users` record exists, link the provider account and reuse the existing user id. Prompt to merge only when emails mismatch.
- Middleware: protect `/admin/**` (admin only) and sensitive API routes (uploads, billing webhooks) with early rejection; keep defense-in-depth checks in route handlers.
- Safety: rate-limit login attempts, audit admin logins, and log suspicious auth events.

## Roles and access control
- Tiers: `none`, `member`, `support`; `admin > 0` always elevated. Tier is derived from active billing records or manual expiration/overrides.
- Rules: `canAccessArchives` requires `support`; `canAccessGenealogy` allows `member` or `support`; admin bypasses. Maintain `isMember` for any non-`none` tier.
- Derive membership from subscription state (see billing) or from a manual expiration override for edge cases; drop legacy static `membership` flags once billing is live.

## Membership and billing automation (Stripe + PayPal)
- Providers: Stripe Checkout + Customer Portal; PayPal subscriptions. Map provider price/plan IDs to AGH tiers (`member` vs `support`) in config.
- Data model: `MembershipSubscription` (id, userId, provider, customerId, subscriptionId, status, tier, planId, currentPeriodEnd, cancelAt, trialEnd, metadata) plus `BillingEvent` log for idempotency and auditing (provider, eventId, payload hash, processedAt, result).
- Webhooks: separate endpoints for Stripe and PayPal; verify signatures, ensure idempotency via `BillingEvent`, and update `MembershipSubscription` + user access timestamps. Reject unsigned/duplicate events.
- Access derivation: a user is active when status is `active`/`trialing`/`past_due` and `currentPeriodEnd` is in the future; set `support` tier for higher plan, `member` for base plan. Expire gracefully on canceled/expired status.
- User flows: subscription page starts Checkout, shows current tier/renewal date, links to Stripe Portal/PayPal manage; emails for renewal/cancel; allow admin to comp users by setting manual `currentPeriodEnd`.

## Admin surfaces
- `/admin/genese`: section list, article list (filter by status), block editor. Admin gate via middleware + in-route check.
- Admin tools for billing (read-only dashboard of subscriptions, search by email, manual comp/expire) and for uploads cleanup.
- All admin actions logged (who, when, before/after).

## Genèse CMS
- Data model: `NewsBlock` as the unit of content (`type`, `content`, `meta`), `NewsArticle` + `NewsSection` in `news_*` tables. Hero image comes from `heroImage`/`heroAlt` on the article or the first `IMAGE` block with `isHero`.
- Block editor: add/reorder/delete blocks; normalize `position` on save. Toolbar + shortcuts for bold/italic/code/quote/lists; heading toggles (Cmd/Ctrl+2 → H2 via `type=HEADING`, `meta.level=2`); block type switches (paragraph/quote/code block).
- Images: insert via upload or URL; require `alt`; optional caption and alignment (`full|wide|left|right`); `isHero` toggle. Return stored URL + dimensions.
- Preview: link to `/genese/[section]/[article]` with preserved `lang`/params.

## Uploads and media
- Admin-only upload endpoint (route handler or server action) with MIME/size validation, EXIF stripping, conversion to `webp/jpeg`, and storage to S3/R2/Supabase or `/public/uploads`.
- Enforce per-article limits (file count, size); reject non-images. Store width/height in `meta`; use `next/image` when dimensions are known. Sanitize HTML blocks; prefer Markdown content.

## Public experiences
- Archives: `/archives` search across `actes`/`personnes` with filters (name, notes, type, role, date, commune…); paged 20 rows. `/acts/[id]` shows details; hide details behind `support` tier when needed.
- Families: `/families` lists surnames by letter/query, then people per family.
- Person + tree: `/person/[id]` shows relatives; `/tree` + `/api/tree` build graphs from `genea`/`genea2` with direction + depth; unauthorized gets `MemberGate`/401.
- Genèse public: `/genese`, section pages, and article pages render ordered blocks (Markdown, headings, quotes, code, HTML when allowed) with featured/hero support.

## Security and compliance
- Enforce https-only cookies in production; no dev fallback for secrets. Centralize input validation and SQL parameterization.
- Rate-limit sensitive routes (login, uploads, billing APIs). Verify all webhook signatures. Sanitize user-rendered content.
- Keep audit logs for auth, billing updates, and admin edits; monitor for anomalies.

## Testing and quality
- Unit/integration tests for auth helpers (`isMember`, `canAccess*`), billing webhook handlers (signature verification, idempotency, tier mapping), and Genèse block save/rendering.
- Smoke/E2E paths: login (credentials + social), subscription checkout + webhook → access granted, archives search gating, admin editor save + public render.
