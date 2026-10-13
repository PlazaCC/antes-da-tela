import { auth } from '@clerk/nextjs/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client for Server Components, Route Handlers and tRPC.
 *
 * Authenticated with the Clerk session token (Supabase third-party auth):
 * RLS sees the Clerk JWT and `public.current_user_id()` maps it to `users.id`.
 * Signed out → requests run as `anon`.
 *
 * `supabase.auth.*` is not available on this client — use Clerk (`auth()`,
 * `getAppUser()`) for anything session related.
 *
 * Always creates a new instance per call — do NOT cache in a module-level
 * variable (required for correctness under Fluid compute / concurrent requests).
 */
export async function createClient() {
  const { getToken } = await auth()

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    accessToken: async () => (await getToken()) ?? null,
  })
}
