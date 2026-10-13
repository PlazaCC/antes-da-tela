import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Next.js Proxy (Edge) — runs before every matched request.
 *
 *   1. `clerkMiddleware` makes the Clerk session available to `auth()` in
 *      Server Components, Route Handlers and tRPC.
 *   2. Forwards the request pathname as `x-pathname` so the authenticated
 *      route-group layout can build the `?next=` redirect URL without
 *      `usePathname()`.
 *   3. Redirects signed-in users from the landing page (/) to /feed before any
 *      React renders (avoids the global-error flash of a Server Component
 *      redirect).
 *
 * Route protection lives in `app/(authenticated)/layout.tsx`, not here.
 *
 * Note: In Next.js 16+ the proxy file convention replaces middleware.ts.
 * The export must be named `proxy` (not `middleware`).
 */
export const proxy = clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname === '/') {
    const { userId } = await auth()
    if (userId) {
      const feedUrl = request.nextUrl.clone()
      feedUrl.pathname = '/feed'
      feedUrl.search = ''
      return NextResponse.redirect(feedUrl)
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico|webmanifest)$).*)',
    '/(api|trpc)(.*)',
  ],
}
