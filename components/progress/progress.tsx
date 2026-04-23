'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ProgressProps {
  current: number
  steps: string[]
  className?: string
}

export function Progress({ current, steps, className }: ProgressProps) {
  return (
    <div className={cn('flex items-center w-full gap-1', className)}>
      {steps.map((label, i) => {
        const step = i + 1
        const isCompleted = step < current
        const isActive = step === current

        return (
          <div key={step} className='flex items-center flex-1 last:flex-none min-w-0'>
            <div
              className={cn(
                'flex items-center justify-center gap-2 rounded-sm px-2 md:px-4 py-2 transition-all duration-300 min-w-0',
                isCompleted && 'bg-state-success/20 border border-state-success/50',
                isActive && 'bg-brand-accent shadow-lg shadow-brand-accent/20',
                !isCompleted && !isActive && 'bg-elevated border border-border-default',
              )}>
              {isCompleted ? (
                <Check className='h-3 w-3 text-state-success flex-shrink-0' />
              ) : (
                <span
                  className={cn(
                    'font-mono text-[10px] md:text-[11px] font-medium tracking-[0.02em]',
                    isActive ? 'text-text-primary' : 'text-text-muted',
                  )}>
                  {step}
                </span>
              )}
              <span
                className={cn(
                  'hidden md:inline font-mono text-[11px] font-medium tracking-[0.02em] uppercase truncate',
                  isActive || isCompleted ? 'text-text-primary' : 'text-text-muted',
                )}>
                {label}
              </span>
            </div>

            {step < steps.length && (
              <div
                className={cn('flex-1 h-[1px] mx-0.5 md:mx-1 min-w-[4px]', isCompleted ? 'bg-brand-accent' : 'bg-border-default')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

