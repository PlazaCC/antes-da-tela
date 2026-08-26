import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'

type Props = { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  // Check if already authenticated before rendering the login form.
  // getClaims() internally calls getSession() which makes a network request
  // to Supabase Auth — wrap in try-catch to avoid crashing on transient
  // failures. redirect() stays outside so NEXT_REDIRECT is not swallowed.
  let isAuthenticated = false
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getClaims()
    isAuthenticated = !!data?.claims
  } catch {
    // Auth check failed — show login form as fallback
  }

  if (isAuthenticated) {
    const { next } = await searchParams
    redirect(next && next.startsWith('/') ? next : '/feed')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base p-6">
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

        <div className="flex flex-col gap-6 rounded-sm border border-border-subtle bg-surface p-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-heading-3 text-text-primary">
              Entrar
            </h1>
            <p className="text-body-small text-text-secondary">
              Use sua conta Google para continuar
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-10 w-full bg-elevated" />}>
            <GoogleAuthButton label="Entrar com Google" />
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
