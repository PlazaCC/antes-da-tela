import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

/**
 * Authenticated route-group layout.
 *
 * Protects every route nested under `app/(authenticated)/`.  The route group
 * name is invisible to the URL — `/publish` stays `/publish`, `/account`
 * stays `/account`, etc.
 *
 * Strategy:
 *   - getClaims() reads the JWT from the cookie set by middleware.  It is a
 *     local operation (no network call) and is safe because proxy.ts
 *     already called getUser() to refresh the token on every request.
 *   - The proxy also forwards the request pathname via `x-pathname` so we
 *     can build an accurate `?next=` redirect URL without usePathname().
 */
export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <AuthCheck>{children}</AuthCheck>
    </React.Suspense>
  )
}

async function AuthCheck({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    const h = await headers()
    const pathname = h.get('x-pathname') ?? '/'
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`)
  }

  return <>{children}</>
}
