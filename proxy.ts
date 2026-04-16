import { updateSession } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Proxy (Edge) — runs before every matched request.
 *
 * Delegates to `updateSession` in `lib/supabase/proxy.ts` which:
 *   1. Refreshes the Supabase access token (rotates via Set-Cookie) so Server
 *      Components always read a non-expired session.
 *   2. Forwards the request pathname as `x-pathname` so the authenticated
 *      route-group layout can build the `?next=` redirect URL without
 *      `usePathname()`.
 *
 * Route protection lives in `app/(authenticated)/layout.tsx`, not here —
 * keeping it in a Server Component gives accurate pathname access and keeps
 * this file focused on a single responsibility.
 *
 * Note: In Next.js 16+ the proxy file convention replaces middleware.ts.
 * The export must be named `proxy` (not `middleware`).
 */
export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (err) {
    // Do not block the request on session proxy errors; log and continue.
    console.error('proxy handler error', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
