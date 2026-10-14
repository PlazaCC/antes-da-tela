'use client'

import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, type ReactNode } from 'react'

/**
 * Wraps <SignIn /> / <SignUp />. Once the session is active (e.g. right after
 * the sign-up code) the Clerk component unmounts; show a redirecting state and
 * do a full navigation so the server-rendered header comes back signed in.
 */
export function AuthFormGate({ destination, children }: { destination: string; children: ReactNode }) {
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) window.location.replace(destination)
  }, [isSignedIn, destination])

  if (isSignedIn) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="size-8 animate-spin rounded-full border-2 border-border-subtle border-t-brand-accent" />
        <p className="text-body-small text-text-secondary">Entrando… estamos te redirecionando.</p>
      </div>
    )
  }

  return (
    <>
      {children}
      <Link
        href="/"
        className="min-h-11 content-center text-label-mono-default text-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:underline">
        ← Voltar ao início
      </Link>
    </>
  )
}
