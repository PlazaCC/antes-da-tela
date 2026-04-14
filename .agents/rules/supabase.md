---
paths:
  - "lib/supabase/**"
  - "middleware.ts"
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "server/**/*.ts"
---

# Supabase Auth Rules

## Client Creation
- **Server Components / Route Handlers / Server Actions**: use `createServerClient` from `@supabase/ssr`.
  ```ts
  import { createServerClient } from "@supabase/ssr"
  import { cookies } from "next/headers"
  
  export const createClient = async () =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => (await cookies()).getAll() } }
    )
  ```
- **Client Components**: use `createBrowserClient` from `@supabase/ssr`.
  ```ts
  import { createBrowserClient } from "@supabase/ssr"
  
  export const createClient = () =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
  ```

## Session Handling
- The session is refreshed automatically in `middleware.ts` — never skip or disable the middleware.
- Always call `supabase.auth.getUser()` (not `getSession()`) in server-side code — `getSession()` is not validated server-side.
- For protected tRPC procedures, verify auth inside the context or a middleware:
  ```ts
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" })
  ```

## Security
- Never expose `SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` in client-side code or `NEXT_PUBLIC_*` env vars.
- Use Row Level Security (RLS) policies in Supabase for data access control.
- Validate ownership in tRPC procedures even when RLS is enabled — defense in depth.

## Realtime
- Use Supabase Realtime channels for live comments via `supabase.channel()`.
- Always clean up subscriptions with `.unsubscribe()` in `useEffect` cleanup.

## Storage
- PDFs and audio files go to Supabase Storage; serve heavy files through Cloudflare CDN proxy.
- Storage bucket policies should enforce authentication before upload.
