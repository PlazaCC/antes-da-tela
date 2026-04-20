import { cn } from '@/lib/utils'
import * as React from 'react'

export interface ReactionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  reactions: { icon: React.ReactNode; label: string; count: number; active?: boolean }[]
  onSelect?: (index: number) => void
  selected?: number
  disabled?: boolean
}

export const ReactionBar = React.forwardRef<HTMLDivElement, ReactionBarProps>(
  ({ className, reactions, onSelect, selected, disabled, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-wrap gap-2', className)} role='group' aria-label='Reactions' {...props}>
      {reactions.map((reaction, i) => {
        const isActive = reaction.active || selected === i
        return (
          <button
            key={`${reaction.label}-${i}`}
            type='button'
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors min-h-[44px] sm:min-h-0',
              isActive
                ? 'bg-brand-accent text-text-primary border-brand-accent'
                : 'bg-elevated text-text-secondary border-border-subtle hover:border-brand-accent hover:text-text-primary',
              disabled && 'pointer-events-none bg-transparent border-transparent',
            )}
            onClick={() => onSelect?.(i)}
            aria-pressed={isActive}
            aria-label={`${reaction.label}: ${reaction.count} reaction${reaction.count !== 1 ? 's' : ''}${isActive ? ', active' : ''}`}
            disabled={disabled}>
            <span aria-hidden='true'>{reaction.icon}</span>
            <span>{reaction.count}</span>
          </button>
        )
      })}
    </div>
  ),
)
ReactionBar.displayName = 'ReactionBar'
