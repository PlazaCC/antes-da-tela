import type { ScriptInsights } from '@/lib/types/script-insights'
import { cn } from '@/lib/utils'

interface ReactionsSummaryProps {
  reactions: ScriptInsights['reactions']
  className?: string
}

/** Reactions left by readers on comments of this script. */
export function ReactionsSummary({ reactions, className }: ReactionsSummaryProps) {
  return (
    <ul className={cn('flex gap-6', className)}>
      {reactions.map((r) => (
        <li key={r.emoji} className='flex items-center gap-2'>
          <span className='text-[20px]' aria-hidden>
            {r.emoji}
          </span>
          <span className='font-display text-[20px] text-text-primary'>{r.count}</span>
        </li>
      ))}
    </ul>
  )
}
