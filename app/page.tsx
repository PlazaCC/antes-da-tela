import { Construction } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { AuthButton } from '@/components/auth-button'
import { HeroCTA } from '@/components/hero-cta'
import { Skeleton } from '@/components/ui/skeleton'
import { isDevToolsEnabled } from '@/lib/dev-tools'

export default function Home() {
  const devEnabled = isDevToolsEnabled()

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Image src="/assets/logo.svg" alt="Antes da Tela" width={83} height={19} priority />
          </Link>
          <Suspense fallback={<Skeleton className="h-9 w-40 bg-elevated" />}>
            <AuthButton />
          </Suspense>
        </div>
      </header>

      {/* Under construction notice */}
      <div className="w-full bg-elevated border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-5 py-2.5 flex items-center gap-2">
          <Construction className="size-3.5 text-brand-accent shrink-0" />
          <p className="text-label-mono-default text-text-muted">
            Plataforma em construção — algumas funcionalidades ainda não estão disponíveis.
          </p>
        </div>
      </div>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-start px-5 py-24">
        <div className="max-w-5xl w-full mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-5 max-w-xl">
            <h1 className="font-display text-heading-1 text-text-primary">
              Roteiros que{' '}
              <span className="text-brand-accent italic">merecem</span>
              <br />
              ser lidos.
            </h1>
            <p className="text-body-large text-text-secondary">
              Plataforma de publicação, leitura e discussão de roteiros audiovisuais.
            </p>
          </div>

          <Suspense
            fallback={<div className="h-11 w-52 rounded-sm bg-elevated animate-pulse" />}
          >
            <HeroCTA />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border-subtle">
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between">
          <p className="text-label-mono-default text-text-muted">
            © 2025 Plaza Creative Collective
          </p>
          {devEnabled && (
            <Link
              href="/development"
              className="text-label-mono-default text-text-muted hover:text-text-secondary transition-colors underline-offset-4 hover:underline"
            >
              Developer tools
            </Link>
          )}
        </div>
      </footer>
    </div>
  )
}
