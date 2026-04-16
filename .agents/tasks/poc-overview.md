# Antes da Tela — POC Execution Overview

> Contexto canônico: `docs/POC.md` · ADR: `docs/adrs/ADR-001-antes-da-tela.md`
> Regras do agente: `.agents/rules/` (typescript, supabase, drizzle, nextjs, ui)

## Ordem de execução obrigatória

```
[01] Design System   → merge feat/design-system + validação de tokens
[02] DB Schema       → tabelas, migrations, storage buckets         ← BLOQUEADOR
[03] Auth            → cadastro, login, sessão SSR, middleware
[04] Upload          → formulário + upload PDF + tRPC scripts router
[05] Leitor          → PDF viewer + tRPC comments router
[06] Home            → listagem SSR + filtros + busca
[07] Perfil          → página pública + tRPC ratings router
```

**Dependências:**

- `[02]` bloqueia tudo
- `[03]` e `[04]` podem rodar em paralelo após `[02]`
- `[05]`, `[06]`, `[07]` dependem de `[02]` + `[04]`

## Stack de referência rápida

| Camada     | Tecnologia                                 |
| ---------- | ------------------------------------------ |
| Framework  | Next.js App Router · TypeScript            |
| Auth       | Supabase Auth · `@supabase/ssr`            |
| API        | tRPC v11 + Zod                             |
| ORM        | Drizzle ORM + `postgres` driver            |
| DB/Storage | Supabase Postgres + Storage                |
| Cache      | TanStack Query + superjson                 |
| Estado UI  | Zustand                                    |
| PDF        | `pdfjs-dist` (dynamic import, client-only) |
| UI         | shadcn/ui + Radix UI + Tailwind v3         |
| Package    | Yarn 4 (Berry)                             |

## Caminhos críticos

```
server/db/schema.ts          ← schema Drizzle (única fonte de verdade do DB)
server/api/root.ts           ← appRouter (registrar todos os routers aqui)
trpc/init.ts                 ← createTRPCContext, createTRPCRouter, publicProcedure
trpc/client.tsx              ← useTRPC (client components)
trpc/server.tsx              ← trpc, HydrateClient (server components / prefetch)
lib/supabase/client.ts       ← createBrowserClient (client components)
lib/supabase/server.ts       ← createServerClient (server components / route handlers)
middleware.ts                ← refreshSession + proteção de rotas
app/api/trpc/[trpc]/route.ts ← handler tRPC HTTP
components/ui/               ← todos os componentes UI
```

## Convenções obrigatórias

- `cn()` de `@/lib/utils` para className
- `createServerClient` em Server Components, `createBrowserClient` em Client Components
- Upload de arquivos: sempre client-side direto para Supabase Storage (Vercel timeout = 10s)
- Validação: Zod schemas reutilizados entre tRPC input e React Hook Form (`zodResolver`)
- Queries tRPC client-side: `useTRPC()` de `@/trpc/client`
- Prefetch server-side: `trpc` + `HydrateClient` de `@/trpc/server`
- **Nunca `npm install`** — usar `yarn add`
- **Tailwind v3** — não usar sintaxe v4

## Next.js — Boas práticas (resumo rápido)

- Prefira Server Components para páginas e pré-carregue dados com `trpc.server` + `HydrateClient` para SEO e performance.
- Separe claramente Client vs Server: use `createBrowserClient` apenas em Client Components e `createServerClient` no servidor/route handlers.
- Importações pesadas (pdfjs, bibliotecas de edição) devem ser carregadas dinamicamente com `next/dynamic({ ssr: false })`.
- Evite expor segredos no bundle (ex.: `SUPABASE_SERVICE_ROLE_KEY`). Use `route.ts` server-side para operações privilegiadas.
- Use `next/font` para otimizar fontes e `next/image` para otimizar imagens quando aplicável.
- Use ISR / cache-control quando fizer sentido para páginas de listagem (Home) para balancear frescor e performance.

## Supabase — Boas práticas (resumo rápido)

- Use `createServerClient` in Server Components / route handlers and `createBrowserClient` in Client Components; never instantiate a browser client on the server.
- Keep `SERVICE_ROLE` keys strictly server-side; expose privileged operations via minimal `route.ts` endpoints that perform the action server-side.
- For files served to the browser (PDFs, avatars), prefer public buckets or generate signed URLs server-side for private content; configure CORS and `Content-Type` correctly.
- Implement RLS policies with `auth.uid()` to protect row-level access; keep business rules in Postgres policies where appropriate.
- Run migrations with `DATABASE_URL_UNPOOLED` and verify SQL before applying in production.

## Comandos de validação pós-task

```bash
yarn build          # zero erros TypeScript + build limpo
yarn lint           # zero warnings ESLint
yarn drizzle-kit generate   # para tasks que alteram schema
yarn drizzle-kit migrate    # aplicar no Supabase (usa DATABASE_URL_UNPOOLED)
```

## Arquivos de cada task

| Task          | Arquivo                                 |
| ------------- | --------------------------------------- |
| Design System | `.agents/tasks/poc-01-design-system.md` |
| DB Schema     | `.agents/tasks/poc-02-db-schema.md`     |
| Auth          | `.agents/tasks/poc-03-auth.md`          |
| Upload        | `.agents/tasks/poc-04-upload.md`        |
| Leitor PDF    | `.agents/tasks/poc-05-leitor.md`        |
| Home          | `.agents/tasks/poc-06-home.md`          |
| Perfil        | `.agents/tasks/poc-07-perfil.md`        |
