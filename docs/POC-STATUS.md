# Estado de Implementação — POC "Antes da Tela" (2026-04-17)

This document summarizes the current repository state against the original POC plan, reflects all completed tasks, and lists remaining open items.

---

## Summary

All 7 original POC tasks have been implemented. The codebase is feature-complete for the defined POC scope. Remaining work consists of infrastructure validation, a few Figma screens not yet translated to code, and optional enhancements.

**Stack (per ADR-001):** Next.js App Router + TypeScript, Supabase Auth (`@supabase/ssr`), Drizzle ORM (schema/migrations), tRPC v11 + Zod, pdfjs-dist, Zustand, TanStack Query + superjson, shadcn/ui + Tailwind v3, PostHog, Sentry, Resend.

---

## Completed (all 7 POC tasks)

### poc-01 — Design System
- CSS custom properties in HSL channel format (`app/globals.css`), Tailwind v3 tokens (`tailwind.config.ts`)
- Fonts: Inter, DM Serif Display, DM Mono via `next/font` in `app/layout.tsx`
- 18+ shadcn/ui components in `components/ui/`: avatar, badge, button, card, checkbox, comment, dialog, drag-zone, dropdown-menu, info, input, label, metric-card, nav-bar, navigation, progress, radio-box, reaction-bar, script-card, skeleton, star-rating, switch, tabs, tag, tooltip
- Playground: `app/development/components/page.tsx` · Design system showcase: `app/development/design-system/page.tsx`

### poc-02 — DB Schema
- Full Drizzle schema: `users` (+ bio), `scripts`, `script_files`, `audio_files`, `comments` (soft delete), `ratings` (unique index + score check)
- RLS policies on all tables; inferred TypeScript types exported from `server/db/schema.ts`
- Drizzle migrations: `drizzle/0000`–`drizzle/0003` (schema), `drizzle/0004` (storage buckets `public = true`)

### poc-03 — Auth
- Google OAuth via Supabase; callback route at `app/auth/callback/route.ts` exchanges code and upserts user
- Login page at `app/auth/login/page.tsx` using `GoogleAuthButton`
- Session middleware via `proxy.ts` + `lib/supabase/proxy.ts`
- Protected route group `app/(authenticated)/layout.tsx` redirects unauthenticated users
- `usersRouter` with `createProfile`, `getProfile`, `updateProfile`, `upsertFromAuth`

### poc-04 — Upload
- 4-step publish form `app/(authenticated)/publish/page.tsx` (Informações, Arquivo, Categorias, Revisão) matching Figma upload flow
- Client-side PDF upload to Supabase Storage `scripts` bucket with progress indicator
- `scriptsRouter` with 6 endpoints: `create`, `getById`, `listRecent`, `listFeatured`, `listByAuthor`, `search`
- Script detail page: `app/scripts/[id]/page.tsx` + `script-page-client.tsx`

### poc-05 — PDF Reader
- `PDFViewer` loaded via `next/dynamic` with `ssr: false` (`components/pdf-viewer/pdf-viewer.tsx`)
- Zustand store controls `currentPage`, `totalPages`, zoom, sidebar state (`components/pdf-viewer/pdf-viewer-store.ts`)
- `CommentsSidebar` auto-fetches comments on page change; authenticated users create comments inline; unauthenticated users see login CTA
- `commentsRouter`: `list`, `create`, `delete` (soft delete via `deleted_at`)
- User avatars shown in comments (PR #9)

### poc-06 — Home
- `HomeClient` with SSR prefetch (`HydrateClient`) of `listRecent` + `listFeatured`
- Genre filter chips update grid without reload via URL params
- `NavBarSearch` with 300ms debounce via `useDebounce` hook (`lib/hooks/use-debounce.ts`)
- Featured section for `is_featured = true` scripts
- `ScriptCard` responsive grid: 1 col mobile → 3 col desktop

### poc-07 — Profile & Ratings
- Public profile page `app/profile/[userId]/page.tsx` — no login required, server-side prefetch
- Account settings `app/(authenticated)/account/page.tsx` — edit name, bio, avatar upload to `avatars` bucket
- `ratingsRouter`: `upsert` (self-rating → `FORBIDDEN`), `getAverage`, `getUserRating`
- `StarRating` with TanStack Query invalidation for real-time average update on script page

---

## Open items (new tasks in `.agents/tasks/review/`)

| Task file | Title | Priority |
|---|---|---|
| `poc-e2e-validation.md` | E2E validation: build, lint, migrations smoke test | P0 |
| `storage-cors-buckets.md` | Apply storage migrations and configure CORS for PDF buckets | P0 |
| `script-modal-preview.md` | Script preview modal from home/search results (Figma: Modal/Roteiro) | P1 |
| `search-filter-sheet.md` | Mobile search sheet and filter page (Figma: Search Sheet, Filter Page) | P1 |
| `script-seo-og-meta.md` | Dynamic OG meta and SEO for script detail pages | P1 |
| `audio-player-integration.md` | Audio player on script reader page (Figma: Player) | P2 |
| `comment-reactions.md` | Wire ReactionBar to tRPC for comment reactions | P2 |

---

## Known gaps / not in POC scope

- Full-text search (Postgres FTS / `pg_trgm`) — currently using `ilike` pattern matching
- Cursor-based pagination on `listRecent` — currently fixed `limit` only
- Email notifications via Resend for comment events — Resend integrated for verification only
- App mobile / PWA
- Marketplace / payments
- Festival submission workflow

---

## Links

- ADR: `docs/adrs/ADR-001-antes-da-tela.md`
- Setup: `docs/SETUP.md`
- Agents context: `.agents/poc-context.json`
- Task archive: `.agents/tasks/review/archived/`
- Drizzle schema: `server/db/schema.ts`
- tRPC root: `server/api/root.ts`
