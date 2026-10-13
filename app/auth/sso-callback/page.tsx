'use client'

import { HandleSSOCallback } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const destination = next && next.startsWith('/') ? next : '/feed'

  function goTo(url: string) {
    if (url.startsWith('http')) window.location.href = url
    else router.replace(url)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base">
      <p className="text-body-small text-text-secondary">Entrando...</p>
      <HandleSSOCallback
        navigateToApp={({ decorateUrl }) => goTo(decorateUrl(destination))}
        navigateToSignIn={() => goTo(`/auth/login?next=${encodeURIComponent(destination)}`)}
        navigateToSignUp={() => goTo(`/auth/login?next=${encodeURIComponent(destination)}`)}
      />
    </div>
  )
}
