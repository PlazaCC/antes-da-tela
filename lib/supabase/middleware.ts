import { createRouteHandlerClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Session proxy — called from `proxy.ts` on every matched request.
 *
 * Responsibilities:
 *   1. Refresh the Supabase access token (rotate via Set-Cookie) so Server
 *      Components always read a non-expired session without an extra network
 *      round-trip on their side.
 *   2. Forward the request pathname as the `x-pathname` request header so
 *      the authenticated route-group layout (`app/(authenticated)/layout.tsx`)
 *      can build an accurate `?next=` redirect URL without `usePathname()`.
 *   3. Redirect authenticated users away from the landing page (/) to /feed.
 *      Done at the middleware level so no React component ever renders for
 *      this case — avoids flash-of-error from global-error boundary.
 *
 * Route protection for authenticated-only routes lives in
 * `app/(authenticated)/layout.tsx`, not here — keeping it in a Server
 * Component gives accurate pathname access and keeps this file focused.
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

  const supabase = await createRouteHandlerClient({
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      // Write rotated tokens back onto the cloned request so Server
      // Components in this same request cycle see the fresh cookies.
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      // Rebuild the response with the updated request (including
      // x-pathname) so the header is preserved after token rotation.
      supabaseResponse = NextResponse.next({
        request: { headers: requestHeaders },
      })
      // Write the same rotated tokens onto the response so the browser
      // stores them.
      cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
    },
  })

  // IMPORTANT: use getUser() — not getClaims() — to trigger a token refresh
  // when the access token is about to expire. getClaims() only reads the JWT
  // locally and never reaches the Supabase Auth server.
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect authenticated users from landing page to feed.
  // Done here (middleware-level, before React renders) to avoid the
  // global-error.tsx flash that a Server Component redirect() can cause.
  if (user && request.nextUrl.pathname === '/') {
    const feedUrl = request.nextUrl.clone()
    feedUrl.pathname = '/feed'
    feedUrl.search = '' // strip any query params from landing page
    const response = NextResponse.redirect(feedUrl)
    // Forward any cookies that were set during the token refresh (handled
    // by setAll above) so the browser receives the rotated tokens.
    supabaseResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        response.headers.append('set-cookie', value)
      }
    })
    return response
  }

  return supabaseResponse
}
