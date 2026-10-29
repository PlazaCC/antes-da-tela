'use client'

import { StepActions } from '@/components/onboarding/step-actions'
import { INTENT_OPTIONS, type UserIntent } from '@/lib/constants/preferences'
import { cn } from '@/lib/utils'

interface IntentStepProps {
  selected: UserIntent[]
  onToggle: (intent: UserIntent) => void
  onContinue: () => void
  isSaving: boolean
}

/** O1 — what the user came to do. Multi-select; at least one. */
export function IntentStep({ selected, onToggle, onContinue, isSaving }: IntentStepProps) {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3'>
        {INTENT_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type='button'
              aria-pressed={isSelected}
              onClick={() => onToggle(option.value)}
              className={cn(
                'text-left rounded-sm border p-4 flex flex-col gap-1 transition-all',
                isSelected
                  ? 'border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent'
                  : 'border-border-subtle bg-elevated hover:border-text-muted',
              )}>
              <span className='font-medium text-text-primary'>{option.title}</span>
              <span className='text-body-small text-text-secondary'>{option.description}</span>
            </button>
          )
        })}
      </div>
      <StepActions primaryLabel='Continuar' onPrimary={onContinue} disabled={selected.length === 0 || isSaving} />
    </div>
  )
}
