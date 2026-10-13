import { PostHogUserIdentifier } from '@/components/posthog-user-identifier'
import { getAppUser } from '@/lib/auth/app-user'
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
 *   - getAppUser() resolves the Clerk session to the `users` row (creating or
 *     linking it on first sign-in); signed out → redirect to login.
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
  const user = await getAppUser()

  if (!user) {
    const h = await headers()
    const pathname = h.get('x-pathname') ?? '/'
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`)
  }

  return (
    <>
      <PostHogUserIdentifier
        userId={user.id}
        email={user.email}
        name={user.name}
      />
      {children}
    </>
  )
}
