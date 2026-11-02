'use client'

import { cn } from '@/lib/utils'

interface ChipGroupProps {
  options: readonly string[]
  selected: readonly string[]
  onToggle: (option: string) => void
  /** Display text for an option; defaults to the option itself. */
  getLabel?: (option: string) => string
  className?: string
}

/** Toggleable option chips (multi- or single-select, decided by the caller's onToggle). */
export function ChipGroup({ options, selected, onToggle, getLabel, className }: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <button
            key={option}
            type='button'
            aria-pressed={isSelected}
            onClick={() => onToggle(option)}
            className={cn(
              'h-9 px-4 rounded-full border text-xs font-medium transition-all first-letter:uppercase',
              isSelected
                ? 'border-brand-accent bg-brand-accent/10 text-brand-accent ring-1 ring-brand-accent'
                : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
            )}>
            {getLabel ? getLabel(option) : option}
          </button>
        )
      })}
    </div>
  )
}
