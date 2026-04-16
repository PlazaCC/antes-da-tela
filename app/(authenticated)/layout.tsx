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
 *   - getUser() contacts the Supabase Auth server to verify the token is still
 *     valid. This is intentionally chosen over getClaims() (which only decodes
 *     the JWT locally) because proxy.ts silently falls through on errors, so a
 *     locally-decodable but server-expired token would pass a getClaims() check.
 *   - The proxy forwards the request pathname via `x-pathname` so we can build
 *     an accurate `?next=` redirect URL without usePathname().
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
  const { data } = await supabase.auth.getUser()

  if (!data?.user) {
    const h = await headers()
    const pathname = h.get('x-pathname') ?? '/'
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`)
  }

  return <>{children}</>
}
