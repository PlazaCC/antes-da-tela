import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { GoogleAuthButton } from '@/components/google-auth-button'
import { Skeleton } from '@/components/ui/skeleton'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex justify-center">
          <Link href="/">
            <Image src="/assets/logo.svg" alt="Antes da Tela" width={83} height={19} priority />
          </Link>
        </div>

        <div className="flex flex-col gap-6 rounded-sm border border-border-subtle bg-surface p-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-heading-3 text-text-primary">Entrar</h1>
            <p className="text-body-small text-text-secondary">
              Use sua conta Google para continuar
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-10 w-full bg-elevated" />}>
            <GoogleAuthButton label="Entrar com Google" />
          </Suspense>
        </div>

        <p className="text-center text-label-mono-default text-text-muted">
          <Link href="/" className="hover:text-text-secondary transition-colors underline-offset-4 hover:underline">
            ← Voltar ao início
          </Link>
        </p>
      </div>
    </div>
  )
}
