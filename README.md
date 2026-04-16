# Antes da Tela

Antes da Tela is a platform for publishing, reading, and discussing audiovisual scripts. Built with Next.js, Supabase, Drizzle ORM, tRPC, and a modern UI stack, it provides a robust foundation for rapid product development and experimentation.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **API:** tRPC v11 + Zod
- **ORM:** Drizzle ORM + `postgres` driver
- **Database:** Supabase Postgres (transaction pooler)
- **Storage:** Supabase Storage + Cloudflare CDN
- **State/UI:** Zustand, shadcn/ui, Radix UI, Tailwind CSS v3
  - Add new shadcn components using the official CLI: `yarn dlx shadcn@latest add <component>` and do not manually edit files in `components/ui/`.
- **PDF Reader:** pdf.js
- **Analytics:** PostHog (client: posthog-js / server: posthog-node)
- **Error Tracking:** Sentry (`@sentry/nextjs`)
- **Email:** Resend
- **Deploy:** Vercel (Hobby / free tier)
- **Package Manager:** Yarn 4 (Berry, node-modules linker)

---

## Getting Started

See [`docs/SETUP.md`](docs/SETUP.md) for the full setup guide.

### Quickstart

```bash
# 1. Install dependencies
corepack enable
yarn install

# 2. Configure environment variables
cp .env.example .env
# Fill in all required values from your Supabase, PostHog, Resend, and Sentry dashboards

# 3. Run database migrations
yarn drizzle-kit migrate

# 4. Start the development server
yarn dev
# Visit http://localhost:3000
```

### Common Commands

- `yarn dev` — Start dev server
- `yarn build` — Production build
- `yarn lint` — Run ESLint
- `yarn drizzle-kit generate` — Generate SQL migration files
- `yarn drizzle-kit migrate` — Apply migrations to Supabase Postgres

---

## Project Structure

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
│       ├── index.ts      # Drizzle db instance
│       └── schema.ts     # Table definitions
├── trpc/
│   ├── init.ts           # createTRPCContext, createTRPCRouter, publicProcedure
│   ├── client.tsx        # TRPCReactProvider, useTRPC (client-side)
│   ├── server.tsx        # trpc, HydrateClient (server-side RSC prefetch)
│   └── query-client.ts   # makeQueryClient with superjson + staleTime
└── drizzle/              # Generated SQL migration files
```

---

## Integrations & Testing

- **Supabase:** Sign up or log in. Confirm user creation in the Supabase dashboard.
- **Sentry:** Trigger an error (e.g., throw an error in a route) and verify it appears in Sentry.
- **PostHog:** Navigate the app and confirm pageview events in the PostHog dashboard.
- **Resend:** Use the password recovery or any email feature and confirm delivery in the Resend dashboard.

### Monitoring & UX (Sentry + Toaster)

- This project uses `@sentry/nextjs` for server and edge error monitoring. Configure `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`, and `SENTRY_SEND_DEFAULT_PII` in your environment (see `.env.example`).
- Server errors are reported to Sentry and route handlers return a consistent JSON payload via `lib/errors.ts` and `lib/api/withErrorHandler.ts`.
- For user-facing transient feedback we use `sonner` via a centralized `AppToaster` component and `lib/feedback.ts` helpers (`notifyError`, `notifySuccess`, `notifyPromise`, etc.). Render `<AppToaster />` in the root layout (already wired in `app/layout.tsx`).

Example: show an error with the Sentry event id so support can correlate logs:

```tsx
import { notifyError } from '@/lib/feedback'

// when you have an event id from captureException
notifyError('Ocorreu um erro inesperado', eventId)
```

---

## Deployment

Deploy to Vercel for production. After the first deploy, run migrations against the production database if needed:

```bash
DATABASE_URL_UNPOOLED=<prod-session-uri> yarn drizzle-kit migrate
```

---

## License

UNLICENSED

---

## References

- [Next.js with Supabase Example](https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md) — official Next.js example used as reference
- [CONTRIBUTING.md](CONTRIBUTING.md) — contribution guidelines and standards
