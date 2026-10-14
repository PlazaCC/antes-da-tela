import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

/** `?next=` if it is a same-site path, otherwise /feed. */
export function safeNext(next: string | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/feed'
}

/**
 * Page frame for the Clerk <SignIn /> / <SignUp /> components. Signed-in
 * users skip straight to `destination`.
 */
export async function AuthPageShell({ destination, children }: { destination: string; children: ReactNode }) {
  // redirect() stays outside the try so NEXT_REDIRECT is not swallowed.
  let isAuthenticated = false
  try {
    const { userId } = await auth()
    isAuthenticated = !!userId
  } catch {
    // Auth check failed — show the form as fallback
  }
  if (isAuthenticated) redirect(destination)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-bg-base px-4 py-10">
      {children}
      <Link
        href="/"
        className="min-h-11 content-center text-label-mono-default text-text-muted underline-offset-4 transition-colors hover:text-text-secondary hover:underline">
        ← Voltar ao início
      </Link>
    </div>
  )
}
