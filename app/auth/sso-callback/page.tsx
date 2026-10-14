'use client'

import { HandleSSOCallback } from '@clerk/nextjs'
import { useAuthDestination } from '@/lib/hooks/use-auth-destination'
import { Suspense } from 'react'

/** Finishes the Clerk Google OAuth flow and sends the user to `?next=`. */
export default function SSOCallbackPage() {
  return (
    <Suspense fallback={null}>
      <SSOCallback />
    </Suspense>
  )
}

function SSOCallback() {
  const { destination, navigate } = useAuthDestination()
  const loginUrl = `/auth/login?next=${encodeURIComponent(destination)}`

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base">
      <p className="text-body-small text-text-secondary">Entrando...</p>
      <HandleSSOCallback
        navigateToApp={navigate}
        navigateToSignIn={() => navigate({ decorateUrl: () => loginUrl })}
        navigateToSignUp={() => navigate({ decorateUrl: () => loginUrl })}
      />
    </div>
  )
}
