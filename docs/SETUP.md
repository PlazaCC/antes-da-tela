# Project Setup — Antes da Tela

Complete step-by-step guide to go from zero to a running local environment.

---

## Prerequisites

- Node.js 20+ (ships with Corepack built in)
- Git
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free) — or see `docs/rfc/RFC-002-infra-deploy.md` for other options

---

## Step 1 — Enable Corepack and activate Yarn 4

Corepack is the official Node.js tool for managing package manager versions per project. No `npm install -g yarn` needed.

```bash
corepack enable
```

---

## Step 2 — Bootstrap the project

Run inside the target directory. The `.` uses the **current folder** as the project root.

```bash
yarn dlx create-next-app --example with-supabase .
```

This scaffolds the full base stack in one command:

| What you get            | Notes                                       |
| ----------------------- | ------------------------------------------- |
| Next.js (App Router)    | TypeScript, ESLint, `src/` dir, `@/*` alias |
| Tailwind CSS            | Pre-configured                              |
| shadcn/ui               | `components.json` initialized               |
| Supabase Auth           | Cookie-based via `@supabase/ssr`            |
| Supabase client helpers | Server, client, and middleware variants     |
| Auth middleware         | Route protection out of the box             |
| Sign-in / Sign-up pages | At `/auth/sign-in` and `/auth/sign-up`      |
| `.env.example`          | Ready to rename                             |

> **Auth note:** The template uses **Supabase Auth** (`@supabase/ssr`) directly rather than Auth.js v5 as written in ADR-001. Since Supabase is already in the stack, this avoids a redundant auth layer. ADR-001 should be updated to reflect this.

---

## Step 3 — Upgrade to Yarn 4 and configure

```bash
# Pin the project to the latest stable Yarn 4
yarn set version stable
```

This writes `"packageManager": "yarn@4.x.x"` into `package.json` and downloads the Yarn 4 binary into `.yarn/releases/`.

### Create `.yarnrc.yml`

Yarn 4 defaults to Plug'n'Play (PnP), which has compatibility issues with several packages in this stack. Use `node-modules` linker for full Next.js compatibility.

```yaml
nodeLinker: node-modules
yarnPath: .yarn/releases/yarn-4.x.x.cjs
```

> Replace `yarn-4.x.x.cjs` with the filename placed in `.yarn/releases/` by the previous command.

### Reinstall with Yarn 4

```bash
yarn install
```

---

## Step 4 — Update `.gitignore`

Add these Yarn 4 entries to `.gitignore`:

```
# Yarn Berry
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
```

**Commit** `.yarn/releases/` — it contains the Yarn binary, ensuring every dev and CI run uses the exact same version without a global install.

---

## Step 5 — Set up the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Region: **South America (São Paulo)**
3. Set a strong database password and save it — needed for the connection strings
4. Wait ~2 minutes for provisioning

### Collect these values from the dashboard

| Value                  | Where to find it                                                             |
| ---------------------- | ---------------------------------------------------------------------------- |
| Project URL            | **Settings → API → Project URL**                                             |
| Publishable (anon) key | **Settings → API → Project API keys → anon public**                          |
| Transaction pooler URI | **Settings → Database → Connection string → Transaction pooler** (port 6543) |
| Session pooler URI     | **Settings → Database → Connection string → Session pooler** (port 5432)     |

---

## Step 6 — Environment variables

Preencha o arquivo `.env` (ou `.env.local` se preferir o padrão Next.js) com os valores do seu projeto Supabase, PostHog, Resend e Sentry:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-public-key>

# Database — transaction pooler (runtime, usado pelo Drizzle)
DATABASE_PASSWORD=<sua-senha>
DATABASE_URL=postgresql://postgres:${DATABASE_PASSWORD}@db.<project-ref>.supabase.co:6543/postgres?pgmode=transaction

# Database — session pooler (apenas para migrações)
DATABASE_URL_UNPOOLED=postgresql://postgres:${DATABASE_PASSWORD}@db.<project-ref>.supabase.co:6543/postgres

# Posthog
NEXT_PUBLIC_POSTHOG_TOKEN=<ph_project_token>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Resend
RESEND_API_KEY=<your-resend-api-key>

# Sentry (adicionado automaticamente pelo wizard, não edite manualmente)
SENTRY_AUTH_TOKEN=<sua-sentry-auth-token>
```

> `.env` já está no `.gitignore` por padrão. Use `.env.local` se preferir o padrão Next.js.

---

## Step 14 — Testando integrações

Após subir o servidor (`yarn dev`), teste cada integração:

### Sentry

- Force um erro em qualquer rota (ex: `throw new Error('Test Sentry!')` em um handler) e verifique se aparece no dashboard do Sentry.

### PostHog

- Acesse qualquer página. Verifique no dashboard do PostHog se eventos de pageview estão sendo capturados.

### Resend

- Utilize a função de envio de e-mail (ex: recuperação de senha) e confira se o e-mail chega ou aparece no dashboard do Resend.

### Supabase

- Crie um usuário ou faça login. Verifique no dashboard do Supabase se o usuário foi criado.

---

---

## Step 7 — Install additional dependencies

```bash
# tRPC v11
yarn add @trpc/server @trpc/client @trpc/tanstack-react-query \
  @tanstack/react-query server-only client-only

# Validation
yarn add zod

# Drizzle ORM
yarn add drizzle-orm postgres
yarn add -D drizzle-kit dotenv

# UI state (PDF reader: current page, zoom, panels)
yarn add zustand

# PDF reader
yarn add pdfjs-dist

# Analytics (client + server)
yarn add posthog-js posthog-node

# Email
yarn add resend
```

---

## Step 8 — Drizzle setup

### `drizzle.config.ts` (project root)

```ts
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env.local' })
config({ path: '.env' })

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
})
```

### `src/server/db/index.ts`

```ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // required for Supabase transaction pooler
})

export const db = drizzle({ client, schema })
```

### `src/server/db/schema.ts` — initial schema

```ts
import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid, pgPolicy } from 'drizzle-orm/pg-core'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // 🛡️ Supabase Best Practice: Always enable RLS on public tables
    // By defining a pgPolicy, Drizzle will also generate the ALTER TABLE ... ENABLE ROW LEVEL SECURITY
    pgPolicy('Users can view and update their own data', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`auth.uid() = id`,
      withCheck: sql`auth.uid() = id`,
    }),
  ],
)
```

> **🛡️ Supabase Security & Best Practice:**
>
> 1. Drizzle's `pgPolicy` ensures **Row Level Security (RLS)** is enabled for your Drizzle migrations.
> 2. When interacting with Drizzle from your backend (`src/server/db/index.ts`), remember you are using the `postgres` role via `DATABASE_URL`! **This bypasses all RLS.**
>    Use Drizzle cautiously for Admin/Server side tasks and implement manual checks, or use the `@supabase/ssr` client for frontend/RLS-bound user actions.

### Run the first migration

```bash
yarn drizzle-kit generate   # generates SQL files in /drizzle
yarn drizzle-kit migrate    # applies migrations to Supabase Postgres
```

---

## Step 9 — tRPC setup

### `src/trpc/init.ts`

```ts
import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return { headers: opts.headers }
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
```

### `src/trpc/query-client.ts`

```ts
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import superjson from 'superjson'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}
```

> `superjson` is required for this file: `yarn add superjson`

### `src/server/api/root.ts`

```ts
import { createTRPCRouter } from '@/trpc/init'

export const appRouter = createTRPCRouter({
  // routers go here: scripts, comments, users, ...
})

export type AppRouter = typeof appRouter
```

### `src/app/api/trpc/[trpc]/route.ts`

```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createTRPCContext } from '@/trpc/init'
import { appRouter } from '@/server/api/root'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  })

export { handler as GET, handler as POST }
```

### `src/trpc/server.tsx`

For server-side prefetching in React Server Components:

```tsx
import 'server-only'
import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cache } from 'react'
import { createTRPCContext } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from '@/server/api/root'
import { createCallerFactory } from '@trpc/server'

const getQueryClient = cache(makeQueryClient)
const caller = createCallerFactory(appRouter)(createTRPCContext)

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(caller, getQueryClient)
```

### `src/trpc/client.tsx`

```tsx
'use client'

import { createTRPCContext } from '@trpc/tanstack-react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { makeQueryClient } from './query-client'
import type { AppRouter } from '@/server/api/root'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

let clientQueryClient: ReturnType<typeof makeQueryClient> | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!clientQueryClient) clientQueryClient = makeQueryClient()
  return clientQueryClient
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: '/api/trpc' })],
    }),
  )

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCProvider>
  )
}
```

Add the provider to `src/app/layout.tsx`:

```tsx
import { TRPCReactProvider } from '@/trpc/client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
```

---

## Step 10 — PostHog setup

### `instrumentation-client.ts` (project root)

```ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: 'history-change',
})
```

### `src/lib/posthog-server.ts`

```ts
import { PostHog } from 'posthog-node'

export function getPostHogClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
}
```

---

## Step 11 — Sentry setup (wizard)

Do **not** install Sentry manually. Use the official wizard — it configures `next.config.ts`, creates all instrumentation files, and handles source maps automatically.

```bash
npx @sentry/wizard@latest -i nextjs
```

The wizard will:

- Install `@sentry/nextjs`
- Create `instrumentation.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`
- Wrap `next.config.ts` with `withSentryConfig`
- Write `SENTRY_AUTH_TOKEN` to `.env.sentry-build-plugin` (add this file to `.gitignore`)

---

## Step 12 — Start the dev server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### Smoke-test the wiring

| URL                                  | Expected                      |
| ------------------------------------ | ----------------------------- |
| `http://localhost:3000`              | Landing page loads            |
| `http://localhost:3000/auth/sign-up` | Sign-up form                  |
| `http://localhost:3000/api/trpc`     | tRPC error response (not 404) |

---

## Step 13 — Deploy to Vercel

> Steps below assume Vercel Hobby. See `docs/rfc/RFC-002-infra-deploy.md` for other options.

1. Push the repo to GitHub
2. [vercel.com/new](https://vercel.com/new) → import repository — Vercel auto-detects Next.js
3. Add all variables from `.env.local` in the **Environment Variables** section
   - `DATABASE_URL_UNPOOLED` is only needed for migrations, not at runtime
   - Add `SENTRY_AUTH_TOKEN` from `.env.sentry-build-plugin` for source map uploads
4. Deploy

After the first production deploy, run migrations against the production database:

```bash
DATABASE_URL_UNPOOLED=<prod-session-uri> yarn drizzle-kit migrate
```

---

## Common Yarn 4 commands

| Action                      | Command                 |
| --------------------------- | ----------------------- |
| Install all dependencies    | `yarn install`          |
| Add a dependency            | `yarn add <package>`    |
| Add a dev dependency        | `yarn add -D <package>` |
| Remove a dependency         | `yarn remove <package>` |
| Run a script                | `yarn <script>`         |
| Run a one-off binary        | `yarn dlx <binary>`     |
| Upgrade all packages        | `yarn up`               |
| Upgrade a specific package  | `yarn up <package>`     |
| Check for outdated packages | `yarn outdated`         |

---

## Setup checklist

- [ ] `corepack enable` ran successfully
- [ ] `yarn dlx create-next-app --example with-supabase .` completed
- [ ] `yarn set version stable` ran — `.yarn/releases/` populated
- [ ] `.yarnrc.yml` created with `nodeLinker: node-modules`
- [ ] `yarn install` completed with Yarn 4
- [ ] Supabase project created in São Paulo region
- [ ] `.env` (ou `.env.local`) populado com todas as variáveis
- [ ] `yarn drizzle-kit migrate` succeeded — verify tables in Supabase Table Editor
- [ ] `yarn dev` starts without errors
- [ ] Sign-up page loads at `/auth/sign-up`
- [ ] `/api/trpc` returns a tRPC error response (not 404)
- [ ] Sentry wizard ran — `instrumentation.ts` e `sentry.*.config.ts` existem
- [ ] Vercel project created and env vars configured
- [ ] **Sentry testado com erro proposital**
- [ ] **PostHog testado com pageview**
- [ ] **Resend testado com envio de e-mail**
- [ ] **Supabase testado com login/cadastro**
