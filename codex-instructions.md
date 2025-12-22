<!-- Guidance for AI coding agents -->
# Codex Instructions — AGH Frontend

Keep changes small, scoped, and aligned with existing patterns. Favor server components unless interactivity is required. Avoid new dependencies or framework/tooling upgrades without approval.

- Project: Next.js 15 app router + TypeScript (`strict`), TailwindCSS 3, Prisma client.
- Commands: `pnpm dev` (turbopack), `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` (Vitest + Testing Library, see `vitest.config.ts`).
- Paths: main app under `app/`; alias `@/*` → `./*` (see `tsconfig.json`).
- Global styles/theme: `app/globals.css` (Haiti palette, glass panels), fonts via `next/font` in `app/layout.tsx` (Playfair Display + Source Sans).

Key references (open before editing):
- `app/layout.tsx`, `app/globals.css` — document shell, fonts, base styles.
- `app/page.tsx` — landing page layout and Tailwind patterns.
- `app/archives/page.tsx` + `app/components/archives/*` + `lib/search.ts` — archives search flow, Prisma `$queryRaw` filters, pagination (page size 20).
- `app/families/page.tsx` — localized copy pattern, Prisma queries, chip navigation.
- `app/tree/page.tsx`, `app/tree/GenealogyExplorer.tsx`, `app/components/tree/GenealogyFlow.tsx`, `app/api/tree/route.ts` — client graph UI (XYFlow + dagre), depth limits, auth gating.
- `app/actions/auth.ts`, `lib/auth.ts`, `lib/prisma.ts` — session cookies, membership tiers, Prisma singleton.
- `app/i18n.ts`, `lib/copy.ts`, `lib/page-params.ts` — localization helpers, query param preservation (`buildPathWithParams`, `buildPreservedForLink`, `getPageContext`).

Patterns & guardrails:
- Use server components for data fetching; mark client components only when needed (`"use client"`).
- Reuse Prisma client from `lib/prisma.ts`; keep raw queries parameterized via Prisma SQL helpers.
- Always preserve `lang` and existing search params via the helpers when linking/redirecting.
- Auth-gated areas should use `getCurrentUser` + `isMember`/`canAccess*`; use `MemberGate` for denials. Keep login/logout as server actions with `lang` preserved.
- Responsiveness: all UI changes must work on very large desktops, laptops, tablets, and phones—check layout and spacing across breakpoints.
- Localization: features must be multilingual (fr, en, es, ht). Add strings for all four locales (extend `app/i18n.ts` if missing) and use `msg(lang, key)` or localized copy objects with `selectCopy`.
- Styling stays in Tailwind with existing tokens (`haiti-*`, `glass-panel`, `pill`). Prefer updating classes over adding new global styles; keep layout widths around `max-w-6xl` with `px-6 py-12`.
- For client graph work, follow existing fetch/abort/error handling, depth caps, and XYFlow/dagre layout approach.

Work style:
- Keep PRs/changes focused (UI vs. data vs. config separately).
- Match TypeScript strictness; avoid `any` unless necessary and documented.
- Run `pnpm lint` and `pnpm test` for changes; aim for coverage on new logic.
- Do not introduce new runtime assumptions (e.g., server-only code in client components or vice versa).

If direction is unclear, propose 2–3 concise options with pros/cons before implementing.
