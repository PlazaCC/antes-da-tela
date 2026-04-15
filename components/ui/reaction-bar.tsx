import { cn } from '@/lib/utils'
import * as React from 'react'

export interface ReactionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  reactions: { icon: React.ReactNode; label: string; count: number; active?: boolean }[]
  onSelect?: (index: number) => void
  selected?: number
}

export const ReactionBar = React.forwardRef<HTMLDivElement, ReactionBarProps>(
  ({ className, reactions, onSelect, selected, ...props }, ref) => (
    <div ref={ref} className={cn('flex gap-2', className)} {...props}>
      {reactions.map((reaction, i) => (
        <button
          key={reaction.label}
          type='button'
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border transition-colors',
            reaction.active || selected === i
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-accent',
          )}
          onClick={() => onSelect?.(i)}
          aria-pressed={reaction.active || selected === i}>
          {reaction.icon}
          <span>{reaction.count}</span>
        </button>
      ))}
    </div>
  ),
)
ReactionBar.displayName = 'ReactionBar'
