# Antes da Tela — Claude Code Instructions

Plataforma de publicação, leitura e discussão de roteiros audiovisuais.
POC para validar: consumo de roteiros, demanda por feedback estruturado, valor de curadoria.

See @docs/adrs/ADR-001-antes-da-tela.md for full architectural decisions.
See @docs/SETUP.md for step-by-step environment setup.
See @package.json for available scripts.

---

## Stack

| Camada      | Tecnologia                                          |
| :---------- | :-------------------------------------------------- |
| Framework   | Next.js (App Router) — TypeScript                   |
| Auth        | Supabase Auth via `@supabase/ssr`                   |
| API         | tRPC v11 + Zod                                      |
| ORM         | Drizzle ORM (migrations only) + Supabase JS SDK (runtime) |
| Banco       | Supabase Postgres                                   |
| Storage     | Supabase Storage + Cloudflare CDN                   |
| Cache       | TanStack Query + superjson                          |
| Estado UI   | Zustand                                             |
| Leitor PDF  | pdf.js                                              |
| UI          | shadcn/ui + Radix UI + Tailwind CSS v3              |
| Analytics   | PostHog (client: posthog-js / server: posthog-node) |
| Erros       | Sentry (via `@sentry/nextjs` wizard)                |
| Email       | Resend                                              |
| Deploy      | Vercel (Hobby / free tier)                          |
| Package mgr | Yarn 4 (Berry) — `nodeLinker: node-modules`         |

---

## Common Commands

```bash
yarn dev               # Start dev server (http://localhost:3000)
yarn build             # Production build
yarn lint              # ESLint
yarn db:generate       # Generate SQL migration files for schema
yarn db:migrate        # Apply schema migrations to Supabase Postgres
```

---

## File Structure Conventions

```
/
├── app/                  # Next.js App Router — pages, layouts, API routes
│   └── api/trpc/[trpc]/  # tRPC HTTP handler
├── components/           # React components (shadcn + custom)
├── lib/                  # Supabase client, shared utilities
│   ├── supabase/         # createClient (server), createBrowserClient, middleware
│   └── posthog-server.ts
├── server/
│   ├── api/root.ts       # appRouter + AppRouter type
│   └── db/
│       └── schema.ts     # Table definitions + RLS policies (Drizzle)
├── trpc/
│   ├── init.ts           # createTRPCContext, createTRPCRouter, publicProcedure
│   ├── client.tsx        # TRPCReactProvider, useTRPC (client-side)
│   ├── server.tsx        # trpc, HydrateClient (server-side RSC prefetch)
│   └── query-client.ts  # makeQueryClient with superjson + staleTime
└── drizzle/              # Generated SQL migration files
```

---

## Critical Patterns

### Supabase Auth (SSR)

- Always use `createServerClient` from `@supabase/ssr` in Server Components / API routes.
- Always use `createBrowserClient` in Client Components.
- Session refresh happens in `middleware.ts` — do not bypass it.
- Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for all server-side auth clients (callback route, tRPC context, session middleware). After `exchangeCodeForSession` the client carries the user JWT — no elevated key needed.
- `SUPABASE_SERVICE_ROLE_KEY` is for privileged server operations only (bypassing RLS). Never use it for auth flows, session reads, or tRPC context.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client or prefix it with `NEXT_PUBLIC_`.

### tRPC

- Context: `createTRPCContext` accepts `{ headers: Headers }` from the request.
- Use `Awaited<ReturnType<typeof createTRPCContext>>` as the generic for `initTRPC.context<>()`.
- `ctx.supabase` — authenticated Supabase client available in all procedures. Use it for all data queries; RLS is enforced automatically via the user JWT.
- `ctx.user` — populated only in `authenticatedProcedure` (lazily calls `getUser()`). Null in `publicProcedure` — do not call `getUser()` in context, only in `authenticatedProcedure`.
- Server-side prefetch: use `trpc` and `HydrateClient` from `@/trpc/server`.
- Client hook: `useTRPC()` from `@/trpc/client`.

### Supabase Data Access

- All runtime data queries go through `ctx.supabase` in tRPC routers — never instantiate a raw DB connection.
- There is no Drizzle runtime client (`server/db/index.ts` was removed). Drizzle is used only for schema management and migrations.
- `DATABASE_URL_UNPOOLED` is only needed for running `yarn drizzle-kit migrate` locally — it is not an application runtime env var.
- Schema lives in `server/db/schema.ts`; migrations output to `drizzle/`.

### Database Migrations

**Centralize EVERYTHING in Drizzle.**

1.  **Tables/Indexes**: Define in `server/db/schema.ts` and run `yarn db:generate`.
2.  **RPCs/Functions/RLS/Storage**: For features not supported by Drizzle DSL, create a custom migration:
    ```bash
    yarn db:generate --custom <name>
    ```
    Then edit the generated SQL file in `drizzle/` to add your custom logic.
3.  Apply with `yarn db:migrate`.

**NEVER use Supabase CLI migrations (`supabase/migrations`)** to avoid history drift.

### shadcn/ui — MANDATORY rules

> **Rule #1 — Always check `components/ui/` first.** Before building any UI element, check if a shadcn primitive already exists. Use it as-is or compose a wrapper.

**Installing components — official CLI only:**
```bash
yarn dlx shadcn@latest add <component>   # e.g. dialog, table, form, select
```
- **Never** manually create or copy files into `components/ui/` — that directory is owned by the shadcn registry and the CLI.
- **Never** edit files inside `components/ui/` directly. If you need custom behavior, create a wrapper (see below).

**Customising components — wrapper pattern:**
Create wrappers in `components/<feature>/<component>.tsx`, not in `components/ui/`:
```tsx
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ConfirmDialog({ className, ...props }) {
  return <Dialog><DialogContent className={cn(className)} {...props} /></Dialog>
}
```
- Always accept and forward the `className` prop.
- Always use `cn()` from `@/lib/utils` for class merging (never string concatenation).
- Use the `asChild` prop (Radix `Slot`) to compose without extra DOM nodes.

**Skill for shadcn work:** invoke `/shadcn` or read `.agents/skills/new-shadcn-component/SKILL.md` for the full install-and-wrap workflow.

### Tailwind CSS v3

- Tailwind v3 — do NOT use v4 syntax (`@import "tailwindcss"` or `@theme` blocks).
- Use design tokens from `tailwind.config.ts` — do not hardcode hex values.
- `tailwind-merge` is in the stack — always use `cn()`, never concatenate class strings.

### Package Manager

- Yarn 4 (Berry). Use `yarn add` / `yarn remove` — never `npm install`.
- Run one-off binaries with `yarn dlx`. Do not install global tools.

---

## Rules

See `.claude/rules/` for detailed, path-scoped rules:

- `typescript.md` — TypeScript + tRPC conventions
- `supabase.md` — Supabase Auth + DB patterns
- `drizzle.md` — ORM schema and migration patterns
- `nextjs.md` — App Router + RSC conventions
- `ui.md` — shadcn/ui + Tailwind rules

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
