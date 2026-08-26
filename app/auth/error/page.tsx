import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'

function ErrorDetail({
  searchParams,
}: {
  searchParams: { error?: string; eventId?: string }
}) {
  const params = searchParams
  return (
    <p className="text-body-small text-text-muted">
      {params?.error
        ? `Código: ${params.error}`
        : params?.eventId
          ? `Ocorreu um erro inesperado. Ref: ${params.eventId}`
          : 'Ocorreu um erro inesperado.'}
    </p>
  )
}

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { error?: string; eventId?: string }
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base p-6">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/logo-white.svg"
              alt="Antes da Tela"
              className="h-5 w-auto"
              width={475}
              height={87}
              priority
            />
          </Link>
        </div>

        <div className="flex flex-col gap-6 rounded-sm border border-border-subtle bg-surface p-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-state-error" />
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-heading-3 text-text-primary">
                Algo deu errado
              </h1>
              <Suspense fallback={null}>
                <ErrorDetail searchParams={searchParams} />
              </Suspense>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full rounded-sm border-border-subtle bg-elevated text-text-primary hover:bg-surface"
          >
            <Link href="/auth/login">Tentar novamente</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
