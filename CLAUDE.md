# Toran by Rigi

Toran is a digital invitation studio: living, animated invitations for every tradition (Hindu, Muslim, Sikh, Jain, Christian, Jewish, secular) and every occasion (weddings, naming, griha pravesh, puja, birthdays, corporate…). Rigi is the parent company.

The app has four faces:

| Face | Who | Where |
|---|---|---|
| **Shop** | Customers: browse, read wording, try a design free, pay | `/`, `/collections`, `/invitations/*`, `/wording/*`, `/made-for-you`, `/try/$slug` (`src/shop/*`) |
| **Customer portal** | Customers after buying: their invitations, guests, cards, payments | `/my`, `/my/payments`, `/my/$id`, `/my/$id/guests`, `/my/$id/cards`, `/my/$id/made` (`src/shop/portal/*`, `src/shop/made/*`) |
| **Invitation** | Guests: the invitation itself | `/$slug`, `/p/$token` preview (`src/invitation/*`) |
| **Studio admin** | Owners and designers: templates, orders, billing, pricing | `/admin/*` (`src/admin/*`) |

Customers only ever see the simple form editor (`src/shop/FormEditor.tsx`). The studio builds templates and fixes any customer's invitation in the visual editor (`src/admin/editor/*`).

## Stack and commands

TanStack Start (React 19, Router, Query, SSR) + Hono API + Drizzle ORM + Cloudflare D1/R2, Tailwind v4, shadcn/ui, Zod v4, Motion/GSAP. The same code also runs on Node (`PLATFORM=node`).

**Node 22 is required.** The machine default is older, so start every shell with:

```sh
source ~/.nvm/nvm.sh && nvm use 22
```

| Task | Command |
|---|---|
| Dev server (usually already running on :5173; don't start a second one there) | `npm run dev` |
| Lint (zero warnings allowed) | `npm run lint` |
| Types | `npx tsc -b` |
| Unit tests (Vitest, `tests/unit/*`) | `npm test` |
| Production build and preview | `npm run build`, `npx vite preview --port 5180` |
| New migration from schema changes | `npx drizzle-kit generate --name <what>` |
| Data-only migration | `npx drizzle-kit generate --custom --name <what>`, then write the SQL |
| Apply migrations | `npm run db:migrate:local` (production: `npm run db:migrate:remote`) |
| Seed demo templates | `npm run db:seed:local` |
| Shop cover posters for templates | `node scripts/dev/posters.mjs [--all]` |

**Dev sign-in:** no email provider runs locally. Codes land in the dev inbox at `/dev-mail` (API: `GET /api/dev/mail`). The admin is `admin@therigi.co`.

## Where things live

```
shared/        Pure TS, used by both sides: zod schemas (shared/schemas/*), types, money, pricing, fx, occasions, cultures, themes
  wording/     The wording library. Server-only: pages get it through server functions or /api/wording
  guides.ts    The search pages' own copy (/invitations/$page, /wording/$page)
server/
  api/         Hono routes: validate with shared zod schemas, call repos, return JSON
  repos/       The ONLY place that builds Drizzle queries
  services/    External calls (mailer, payments, fx rates, stock photos, translation)
  platform/    Cloudflare and Node adapters (db, blob, cache, rate limit). Nothing else touches the platform.
  db/schema.ts Drizzle schema (portable SQLite types; JSON as text, money as integers)
src/
  routes/      TanStack file routes. routeTree.gen.ts is generated; never edit it.
  server-fns/  createServerFn wrappers for SSR loaders (the only src/ code that may import server/)
  shop/        Customer shop UI (dark editorial pages, form editor, sign-in); portal/ is the /my shell
  admin/       Studio UI: kit/ (DataTable, PanelCard, PageHeader, FormField…), shell/, editor/, composer/
  invitation/  The invitation engine (sections, openings, scenes). Renders inside .inv-root from --inv-* tokens only.
    luxury/    The premium component library, built stage by stage (see docs/luxury/README.md: docs + progress tracker).
migrations/    SQL migrations (drizzle-kit). Never edit one that has been applied.
scripts/dev/   Playwright scripts that drive the real app (journey, responsive, posters…)
```

## Architecture rules (lint enforces most of these)

- **Ports and adapters.** No `cloudflare:*`, `@cloudflare/*` or `process.env` outside `server/platform/**` and `server/entries/**`. Read config via `getPlatform().config`.
- **Layering.** `src/` never imports `server/` (except `src/server-fns/*`). `shared/` imports nothing from `src/` or `server/`. Only `server/repos/*` may import `drizzle-orm`: if a service needs data, add a repo function (see `server/repos/settings.ts`).
- **One schema, both sides.** Every request body is validated with a zod schema from `shared/schemas/*`. The UI imports the same types.
- **Data access.**
  - SSR pages load through a route `loader` plus a server function.
  - Client-only screens (`ssr: false`) use `@/lib/api` (`api`, `post`, `patch`, `upload`) with TanStack Query.
- **Money is integer minor units plus an ISO currency, always.**
  - Format with `formatMoney()` from `shared/money.ts`, which knows each currency's decimals (JPY 0, KWD 3).
  - Never store floats or formatted strings.
- **Pricing** (`shared/pricing.ts`, `shared/fx.ts`):
  - Every template has its own price: ₹ for India, $ for everyone else. Customers never see packages.
  - Outside India the $ price is converted at a stored exchange-rate snapshot (`server/services/fx.ts`, open.er-api.com) and rounded clean (`niceAmount`). The API is never called per visitor.
  - Prices show everywhere in the shop (`SHOW_SHOP_PRICES`); solemn designs never show a sale price.
  - Shop orders are created with the exact price shown (`createOrder(…, { packagePrice })`).
- **Nothing exists until it is paid for** (`server/repos/checkouts.ts`, `server/services/payments.ts`).
  - "Buy" makes a `checkouts` row only. The order, invoice and invitation are made together, once, after the server has re-read the payment from Razorpay and checked its amount and currency.
  - The page, the webhook and the cron job can each finish a checkout. `checkoutPaid` must stay safe to call twice. Never trust the browser's word that something was paid.
  - `paymentMode` is `razorpay`, `fake` (development only) or `off` (nobody can buy). Razorpay gets the amount, currency and our reference, never customer data.
  - An order the studio makes by hand can be unpaid; until something is paid the customer’s invitation stays hidden and locked (`isUnpaid`).
- **Customers edit everything but the look**: words, photos, ceremonies, languages, music, replies, gifts, wishes, and which sections show and in what order (`customerInput`, `shared/sections.ts`).
  - The server takes the design and each section's styling from the database (`server/repos/store.ts → applyContent`). Never trust a design sent by a customer.
  - Cards follow the invitation: a ceremony removed, or Ceremonies switched off, removes its cards too (`shared/cards.ts`).
- **Done-for-you** (`shared/made.ts`, `server/repos/made.ts`): the studio makes the invitation from what the customer sends. An add-on on the order (`made_for_you`); the order's status says whose turn it is.
  - While the studio has it (`studioHasIt`), the customer can't save or publish. Nothing is published before their first look.
  - What they send lives under `orders/<id>/` in blob storage, never `public/`, and is only ever served as a download to the customer or the studio.
- **Search engines** (`server/seo.ts`, `src/lib/share-meta.ts`): customers' invitations are always noindex; samples and guide pages may be listed, in production only. A new public page needs a canonical link and a sitemap entry.
- **Cultural respect.**
  - Sacred text (mantras, Quranic verses, Gurbani, Hebrew blessings) comes from the vetted library or the customer, never from AI.
  - No destructive effects on sacred text or names of God.
- **Performance.**
  - Lists and catalogue pages show posters (`templates.poster_key`), never live iframes of invitations.
  - The landing page must reach its largest paint in under 500 ms on the production build, phone included. Measure before and after anything heavy.
  - First-screen words never start hidden or wait for script: use `Settle` (CSS, moves only) there and `Rise` further down the page.

## Code style

- **Format.** Prettier: 4 spaces, single quotes, semicolons, trailing commas, width 100. ESLint is typescript-eslint `strictTypeChecked` plus `@stylistic`.
  - Always run **`eslint --fix` first, then `prettier --write`**, on the files you changed. Then run plain `eslint` to confirm.
- **Lint and Prettier disagree** about objects. `@stylistic/object-property-newline` wants one property per line once an object has two or more.
  - **Fix:** never fight it inline. Pull the object into a named variable, and name inline type literals with 2+ members as an `interface`.
  - **Examples:** `style={{ width, height }}` → `const frame = { … }`; `({ a, b }: { a: string; b: number })` → `interface Props`.
- **No `!` non-null assertions, no `any`, no `@ts-ignore`.** Narrow the type properly. `noUncheckedIndexedAccess` is on, so array and record reads may be `undefined`.
- **No dynamic `delete`.** Rebuild with `Object.fromEntries(Object.entries(x).filter(…))`.
- **React hooks lint is strict:**
  - No `Date.now()` or `Math.random()` during render (use `useState(() => …)`).
  - No reading `ref.current` in render.
  - No synchronous `setState` inside `useEffect`; use TanStack Query or derive the value.
  - Event handlers are written as `() => { doThing(); }` (no implicit returns).
- **Comments.** One line, saying **why**, not what. Match the existing tone, e.g. `// Read once: the lock only matters at the moment the editor opens.`
- **Logical CSS only** (RTL for Arabic, Urdu, Hebrew): `ms-/me-/ps-/pe-/start-/end-/text-start`, never `ml-/mr-/left-/right-`.
- **Accessibility.**
  - Every icon-only button has an `aria-label`.
  - Form controls have labels (`FormField`, or `htmlFor` + `id`).
  - No `autoFocus`.
  - Motion respects `prefers-reduced-motion` (`motion-reduce:`, `useReducedMotion`).
- **Copy.** Plain, warm, sentence case. Explain things in the customer's words ("Your words stay on this device for a day"), not system terms.

## UI rules

- **Admin = the PayD design system.**
  - **Layout:** graphite page, white cards (`ring-1 ring-foreground/10`, no shadow); 32px controls (`h-8`, `rounded-control`).
  - **Type:** Hanken Grotesk 14px; labels 11px uppercase muted.
  - **Building blocks:**
    - **List pages use `DataTable`** from `@/admin/kit/data-table`: one card holding title, search, Filter facets, sortable headers and pagination. Copy `src/routes/admin/customers/index.tsx`.
    - Editing a row opens a **`Sheet`** (right-hand panel), not a new page or an inline form.
    - Empty and loading states use `PanelCard` with `EmptyState` / `PageSkeleton`. Statuses use `ToneBadge`.
  - New admin pages need a nav entry (`src/admin/shell/nav.ts`), a breadcrumb (`breadcrumbs.tsx`) and the right `can()` permission (`shared/permissions.ts`). The API must check the same permission.
- **Customer portal (`/my`) = the admin design**, inside `PortalShell`: `DataTable`, `PanelCard` and `PageHeader` as above.
  - Guests share one board with the studio (`src/admin/guests/GuestsBoard.tsx`). Change it once; on phones it shows the tap-to-send list.
- **Shop = night-and-gold editorial.**
  - **Tokens:** night, wine, gold, ivory; Cormorant display serif; one italic gold accent word in headings.
  - **Pieces:** reuse `src/shop/landing.tsx` (`Settle`, `Rise`, `SectionHeading`, `PosterPhone`, `TemplateTile`, `PriceTag`) and `ShopShell`.
  - **Must work at phone width:** 16px gutters, no sideways scroll, the main call-to-action visible on the first screen.
- **Invitation engine is isolated.** It paints only from `--inv-*` variables inside `.inv-root`; admin and shop styles must never leak in.

## Working rules for Claude

1. **Read before you write.**
   - Find the existing pattern (a sibling route, kit component or repo) and copy it. Don't invent a parallel one.
   - Check `shared/` before adding a helper.
2. **Stay in scope.** Change what the task needs. Don't reformat, rename or "tidy" unrelated files.
   - **Never run Prettier or ESLint `--fix` across the whole repo.** Some files are owned by a parallel session, so leave them alone unless asked:
     - `src/invitation/openings/*`
     - `src/admin/shell/login-crown.tsx`
     - `src/admin/shell/login-scenes.tsx`
3. **Done means verified.** Before saying something works:
   - **Checks:** `npx tsc -b`, `eslint` on changed files, and `npm test` all pass.
   - **UI changes:** drive the real app with a Playwright script in the scratchpad and look at the screenshots. Import Playwright by absolute path: `/Users/rishikapadia/Documents/digital_invitation/node_modules/@playwright/test/index.mjs`.
   - Check desktop (1440×900) and phone (390×844): no page errors, no horizontal overflow.
   - **Flows** (buy, publish, pricing): assert the end result (order total, saved keys, live page), not just that a button exists.
   - If something isn't verified, say so plainly.
4. **Schema changes** go through a drizzle-kit migration, applied locally. Mention in the summary that production needs `npm run db:migrate:remote`. Never edit an applied migration; write a new one.
5. **Ask before anything hard to reverse:** deleting data, destructive SQL, force pushes, publishing, sending to external services. Commit only when asked.
6. **External calls** (rates, stock photos, AI) live in `server/services/*`, are cached where possible, and never send customer or user data.
7. **Report like a teammate.**
   - Lead with the outcome.
   - Name the files that matter and give any numbers (load times, totals).
   - List what's left or needs a decision.
   - Prefer one clear recommendation over a long list of options.
