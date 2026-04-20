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
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((label, i) => {
        const step = i + 1
        const isCompleted = step < current
        const isActive = step === current

        return (
          <div key={step} className='flex items-center flex-1 last:flex-none'>
            <div
              className={cn(
                'flex items-center gap-2 rounded-sm px-4 py-2 transition-colors whitespace-nowrap',
                isCompleted && 'bg-state-success/70 border border-state-success',
                isActive && 'bg-brand-accent',
                !isCompleted && !isActive && 'bg-elevated border border-border-default',
              )}>
              {isCompleted ? (
                <Check className='h-3 w-3 text-text-primary flex-shrink-0' />
              ) : (
                <span
                  className={cn(
                    'font-mono text-[11px] font-medium tracking-[2%]',
                    isActive ? 'text-text-primary' : 'text-text-muted',
                  )}>
                  {step}
                </span>
              )}
              <span
                className={cn(
                  'hidden sm:inline font-mono text-[11px] font-medium tracking-[2%] uppercase',
                  isActive || isCompleted ? 'text-text-primary' : 'text-text-muted',
                )}>
                {label}
              </span>
            </div>

            {step < steps.length && (
              <div
                className={cn('flex-1 h-0.5 mx-1', isCompleted ? 'bg-brand-accent' : 'bg-border-default')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
