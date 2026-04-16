import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for use in Server Components and Server Actions.
 *
 * Always creates a new instance per call — do NOT cache in a module-level
 * variable (required for correctness under Fluid compute / concurrent requests).
 *
 * Cookie behaviour:
 *   - `setAll` errors are silently swallowed because Server Components cannot
 *     set cookies directly. Token rotation is handled upstream by the
 *     middleware (`proxy.ts` → `lib/supabase/middleware.ts`) before the
 *     Server Component renders, so the session is always fresh.
 *   - For Route Handlers that must write cookies (e.g. the OAuth callback),
 *     use `createRouteHandlerClient()` below, which propagates `setAll` errors.
 *
 * Uses only the anon/publishable key — no service role key required.
 */
type CookieEntry = { name: string; value: string; options?: Record<string, unknown> }

type CookieStore = {
  getAll(): CookieEntry[]
  setAll?(cookies: CookieEntry[]): void
  set?: (name: string, value: string, options?: Record<string, unknown>) => void
}

export async function createClient(cookieStoreParam?: CookieStore) {
  const cookieStore = cookieStoreParam ?? (await cookies())

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          if (typeof cookieStore.setAll === 'function') {
            cookieStore.setAll(cookiesToSet)
          } else if (typeof cookieStore.set === 'function') {
            // Adapter for request.cookies (which exposes .set(name, value))
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set!(name, value, options))
          }
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('createClient: failed to set cookies in Server Component:', err)
          }
        }
      },
    },
  })
}

/**
 * Server-side Supabase client for Route Handlers.
 *
 * Identical to `createClient()` except `setAll` errors are NOT swallowed —
 * Route Handlers can and must write cookies (e.g. to persist an OAuth session
 * after `exchangeCodeForSession`).
 */
export async function createRouteHandlerClient(cookieStoreParam?: CookieStore) {
  const cookieStore = cookieStoreParam ?? (await cookies())

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        if (typeof cookieStore.setAll === 'function') {
          cookieStore.setAll(cookiesToSet)
        } else if (typeof cookieStore.set === 'function') {
          // Adapter for request.cookies
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set!(name, value, options))
        } else {
          throw new Error('cookieStore does not support setAll or set')
        }
      },
    },
  })
}
