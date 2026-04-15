import { Construction } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { AuthButton } from '@/components/auth-button'
import { Skeleton } from '@/components/ui/skeleton'
import { isDevToolsEnabled } from '@/lib/dev-tools'

export default function Home() {
  const devEnabled = isDevToolsEnabled()

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='w-full border-b border-subtle'>
        <div className='max-w-5xl mx-auto px-5 h-16 flex items-center justify-between'>
          <Link href='/'>
            <Image src='/assets/logo.svg' alt='Antes da Tela' width={83} height={19} priority />
          </Link>
          <Suspense fallback={<Skeleton className='h-6 w-24' />}>
            <AuthButton />
          </Suspense>
        </div>
      </header>

      {/* Under construction banner */}
      <div className='w-full bg-elevated border-b border-subtle'>
        <div className='max-w-5xl mx-auto px-5 py-3 flex items-center gap-3'>
          <Construction className='size-4 text-brand-accent shrink-0' />
          <p className='text-body-small text-secondary'>
            Esta plataforma está em construção — algumas funcionalidades ainda não estão disponíveis.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className='flex-1 flex flex-col items-center justify-center px-5 py-24'>
        <div className='max-w-md text-center flex flex-col gap-6'>
          <div className='flex flex-col gap-3'>
            <h1 className='font-display text-heading-1 text-primary'>Em breve.</h1>
            <p className='text-body-large text-secondary'>
              A plataforma de publicação, leitura e discussão de roteiros audiovisuais está sendo construída.
            </p>
          </div>
          <p className='text-body-default text-muted'>Cadastre-se para ser notificado quando abrirmos.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className='flex items-center justify-center gap-6 py-6 border-t border-subtle'>
        {devEnabled && (
          <Link
            href='/development'
            className='text-body-small text-muted hover:text-secondary underline-offset-4 hover:underline transition-colors'>
            Developer tools
          </Link>
        )}
      </footer>
    </div>
  )
}
