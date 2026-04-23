import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className='min-h-[80vh] flex flex-col items-center justify-center p-5 text-center gap-6'>
      <div className='w-20 h-20 rounded-full bg-elevated flex items-center justify-center'>
        <FileQuestion className='w-10 h-10 text-text-muted' />
      </div>

      <div className='flex flex-col gap-3 max-w-lg'>
        <h1 className='font-display text-heading-1 text-text-primary uppercase tracking-tighter'>
          404 — Página não encontrada
        </h1>
        <p className='text-body-large text-text-secondary'>
          Ops! Parece que o roteiro que você está procurando ainda não foi escrito ou foi removido.
        </p>
      </div>

      <Link
        href='/'
        className='flex items-center gap-2 px-8 h-12 rounded-sm bg-brand-accent text-white font-semibold text-body-default hover:bg-brand-accent/90 transition-colors shadow-lg shadow-brand-accent/20 mt-4'
      >
        <Home className='w-5 h-5' />
        Explorar outros roteiros
      </Link>
    </main>
  )
}
