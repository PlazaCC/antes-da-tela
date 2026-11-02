import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface OnboardingShellProps {
  /** 1-based position of the current step, out of `total`. Hidden when null. */
  current: number | null
  total: number
  title: string
  description?: string
  onBack?: () => void
  children: ReactNode
  className?: string
}

export function OnboardingShell({ current, total, title, description, onBack, children, className }: OnboardingShellProps) {
  return (
    <main className={cn('w-full max-w-[560px] mx-auto px-5 py-10 md:py-16 flex flex-col gap-8', className)}>
      {current !== null && (
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <p className='font-mono text-xs text-text-muted uppercase tracking-wider'>
              Passo {current} de {total}
            </p>
            {onBack && (
              <button type='button' onClick={onBack} className='text-xs text-text-muted hover:text-text-secondary'>
                ← Voltar
              </button>
            )}
          </div>
          <div className='flex gap-1' aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={cn('h-1 flex-1 rounded-full', i < current ? 'bg-brand-accent' : 'bg-elevated')} />
            ))}
          </div>
        </div>
      )}
      <header className='flex flex-col gap-2'>
        <h1 className='font-display text-heading-2 text-text-primary'>{title}</h1>
        {description && <p className='text-body-small text-text-secondary'>{description}</p>}
      </header>
      {children}
    </main>
  )
}
