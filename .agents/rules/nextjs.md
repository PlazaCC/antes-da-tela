---
paths:
  - "app/**"
---

# Next.js App Router Rules

## Component Types
- Default to **Server Components** — add `"use client"` only when you need browser APIs, event handlers, or hooks.
- Never import a Client Component into a Server Component without a boundary — use `Suspense` + `loading.tsx`.
- Use `"use server"` for Server Actions in `app/` forms; keep business logic in tRPC routers.

## Data Fetching
- Prefer tRPC server-side prefetch (`trpc.<router>.<procedure>.prefetch()` + `HydrateClient`) for RSC pages.
- Use `cache()` from React for deduplication of repeated server-side fetches within the same request.
- `staleTime` is set to 30s in `makeQueryClient` — do not override globally.

## Routing
- Pages: `app/<route>/page.tsx`.
- Layouts: `app/<route>/layout.tsx`.
- Loading states: `app/<route>/loading.tsx`.
- Error boundaries: `app/<route>/error.tsx` (must be a Client Component).
- API routes: `app/api/<path>/route.ts`.

## Auth-Protected Routes
- Auth is Clerk (RFC-005). `proxy.ts` runs `clerkMiddleware`; it does not protect routes.
- Route protection lives in `app/(authenticated)/layout.tsx` — put protected pages under that route group.
- Never use `supabase.auth.*` — there is no Supabase Auth session.
- Protected page pattern (server):
  ```ts
  import { getAppUser } from '@/lib/auth/app-user'

  const user = await getAppUser() // user.id is users.id (uuid)
  if (!user) redirect('/auth/login')
  ```

## Performance
- Use `next/image` for all images — specify `width` and `height` or use `fill` with a sized container.
- Use `next/link` for internal navigation — never `<a href>`.
- Dynamic imports (`next/dynamic`) for heavy client components (e.g., pdf.js viewer).

## Metadata
- Define `export const metadata: Metadata` in each `page.tsx` for SEO.
- Use descriptive `title` and `description` specific to the page content.
