import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { EmailAuth } from '@/components/auth/email-auth'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@clerk/nextjs/server'

type Props = { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  // Already signed in → skip the login form. redirect() stays outside the
  // try so NEXT_REDIRECT is not swallowed.
  let isAuthenticated = false
  try {
    const { userId } = await auth()
    isAuthenticated = !!userId
  } catch {
    // Auth check failed — show login form as fallback
  }

  if (isAuthenticated) {
    const { next } = await searchParams
    redirect(next && next.startsWith('/') ? next : '/feed')
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-base p-6">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/logo-white.svg"
              alt="Antes da Tela"
              className="h-11 w-auto"
              width={475}
              height={87}
              priority
            />
          </Link>
        </div>

        <div className="flex flex-col gap-6 rounded-sm border border-border-subtle bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-heading-3 text-text-primary">
              Entrar
            </h1>
            <p className="text-body-small text-text-secondary">
              Use sua conta Google ou seu e-mail
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-10 w-full bg-elevated" />}>
            <GoogleAuthButton label="Entrar com Google" className="h-11" />
          </Suspense>

          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border-subtle" />
            <span className="text-label-mono-caps uppercase text-text-muted">ou</span>
            <span className="h-px flex-1 bg-border-subtle" />
          </div>

          <Suspense fallback={<Skeleton className="h-64 w-full bg-elevated" />}>
            <EmailAuth />
          </Suspense>
        </div>

        <p className="text-center text-label-mono-default text-text-muted">
          <Link
            href="/"
            className="underline-offset-4 transition-colors hover:text-text-secondary hover:underline"
          >
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  )
}
