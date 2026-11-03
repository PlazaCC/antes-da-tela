import type { ScriptReadStats } from '@/lib/types/script-reads'
import { cn } from '@/lib/utils'
import { formatCount } from '@/lib/utils/format-count'
import { readRate } from '@/lib/utils/read-rate'

interface ReadingProgressProps {
  reads: ScriptReadStats
  className?: string
}

/** How many readers reached each quarter of the script. */
export function ReadingProgress({ reads, className }: ReadingProgressProps) {
  if (reads.readers === 0) {
    return <p className='text-body-small text-text-muted'>Ninguém leu ainda.</p>
  }
  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {reads.milestones.map(({ milestone, count }) => {
        const rate = readRate(count, reads.readers)
        return (
          <li key={milestone} className='flex items-center gap-3'>
            <span className='w-24 shrink-0 text-body-small text-text-secondary'>
              {milestone === 100 ? 'Até o fim' : `${milestone}% do texto`}
            </span>
            <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-border-default'>
              <div className='h-full bg-brand-accent' style={{ width: `${(count / reads.readers) * 100}%` }} />
            </div>
            <span className='w-28 shrink-0 text-right font-mono text-[11px] text-text-muted'>
              {formatCount(count, 'leitor', 'leitores')}
              {rate !== null && ` · ${rate}%`}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
