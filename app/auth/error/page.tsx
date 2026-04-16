import { AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'

function ErrorDetail({ searchParams }: { searchParams: { error?: string; eventId?: string } }) {
  const params = searchParams
  return (
    <p className='text-body-small text-text-muted'>
      {params?.error
        ? `Código: ${params.error}`
        : params?.eventId
          ? `Ocorreu um erro inesperado. Ref: ${params.eventId}`
          : 'Ocorreu um erro inesperado.'}
    </p>
  )
}

export default function ErrorPage({ searchParams }: { searchParams: { error?: string; eventId?: string } }) {
  return (
    <div className='min-h-screen bg-bg-base flex flex-col items-center justify-center p-6'>
      <div className='w-full max-w-sm flex flex-col gap-8'>
        <div className='flex justify-center'>
          <Link href='/'>
            <Image src='/assets/logo.svg' alt='Antes da Tela' width={83} height={19} priority />
          </Link>
        </div>

        <div className='flex flex-col gap-6 rounded-sm border border-border-subtle bg-surface p-8'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='size-5 text-state-error shrink-0 mt-0.5' />
            <div className='flex flex-col gap-2'>
              <h1 className='font-display text-heading-3 text-text-primary'>Algo deu errado</h1>
              <Suspense fallback={null}>
                <ErrorDetail searchParams={searchParams} />
              </Suspense>
            </div>
          </div>

          <Button
            asChild
            variant='outline'
            className='w-full border-border-subtle bg-elevated text-text-primary hover:bg-surface rounded-sm'>
            <Link href='/auth/login'>Tentar novamente</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
