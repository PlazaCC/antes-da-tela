import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Session proxy — called from `middleware.ts` on every matched request.
 *
 * Responsibilities:
 *   1. Refresh the Supabase access token (rotate via Set-Cookie) so Server
 *      Components always read a non-expired session without an extra network
 *      round-trip on their side.
 *   2. Forward the request pathname as the `x-pathname` request header so
 *      the authenticated route-group layout (`app/(authenticated)/layout.tsx`)
 *      can build an accurate `?next=` redirect URL without `usePathname()`.
 *
 * Route protection is NOT done here — it lives in
 * `app/(authenticated)/layout.tsx` where the exact pathname is always
 * available and the redirect URL can be built accurately.
 *
 * Uses only the anon/publishable key — no service role key required.
 */
export async function updateSession(request: NextRequest) {
  // Forward the pathname to Server Components via request header.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Initial response; may be rebuilt inside setAll if tokens rotate.
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write rotated tokens back onto the cloned request so Server
          // Components in this same request cycle see the fresh cookies.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Rebuild the response with the updated request (including
          // x-pathname) so the header is preserved after token rotation.
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          // Write the same rotated tokens onto the response so the browser
          // stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser() — not getClaims() — to trigger a token refresh
  // when the access token is about to expire.  getClaims() only reads the JWT
  // locally and never reaches the Supabase Auth server.
  await supabase.auth.getUser()

  return supabaseResponse
}
