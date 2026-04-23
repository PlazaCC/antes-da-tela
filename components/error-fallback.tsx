'use client'

import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ErrorFallbackProps {
  title?: string
  message?: string
  reset?: () => void
  className?: string
}

export function ErrorFallback({ 
  title = 'Algo deu errado', 
  message = 'Ocorreu um erro inesperado. Por favor, tente novamente.', 
  reset,
  className 
}: ErrorFallbackProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[400px] p-8 text-center gap-6 animate-in fade-in duration-500',
      className
    )}>
      <div className='w-16 h-16 rounded-full bg-state-error/10 flex items-center justify-center'>
        <AlertTriangle className='w-8 h-8 text-state-error' />
      </div>
      
      <div className='flex flex-col gap-2 max-w-md'>
        <h2 className='font-display text-heading-3 text-text-primary'>{title}</h2>
        <p className='text-body-default text-text-secondary'>{message}</p>
      </div>

      <div className='flex items-center gap-4 mt-2'>
        {reset && (
          <button
            onClick={reset}
            className='flex items-center gap-2 px-6 h-10 rounded-sm bg-brand-accent text-white font-semibold text-body-small hover:bg-brand-accent/90 transition-colors'
          >
            <RefreshCcw className='w-4 h-4' />
            Tentar novamente
          </button>
        )}
        
        <Link
          href='/'
          className='flex items-center gap-2 px-6 h-10 rounded-sm border border-border-default text-text-secondary font-semibold text-body-small hover:bg-elevated hover:text-text-primary transition-colors'
        >
          <Home className='w-4 h-4' />
          Voltar para Home
        </Link>
      </div>
    </div>
  )
}
