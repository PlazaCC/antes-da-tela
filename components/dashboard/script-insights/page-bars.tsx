import { cn } from '@/lib/utils'

interface PageBarsProps {
  counts: Array<{ page: number; count: number }>
  pageCount: number | null
  /** Tooltip text for one page, e.g. "Página 3: 2 comentários". */
  describe: (page: number, count: number) => string
  ariaLabel: string
  /** How many of the busiest pages to list under the chart. */
  topCount?: number
  className?: string
}

/** One bar per page of the script, height by count, plus the busiest pages. */
export function PageBars({ counts, pageCount, describe, ariaLabel, topCount = 3, className }: PageBarsProps) {
  const byPage = new Map(counts.map((p) => [p.page, p.count]))
  const lastPage = Math.max(pageCount ?? 0, ...counts.map((p) => p.page))
  const max = Math.max(...counts.map((p) => p.count))
  const top = [...counts].sort((a, b) => b.count - a.count || a.page - b.page).slice(0, topCount)

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div>
        <div className='flex h-24 items-end gap-px' role='img' aria-label={ariaLabel}>
          {Array.from({ length: lastPage }, (_, i) => {
            const count = byPage.get(i + 1) ?? 0
            return (
              <div
                key={i}
                title={describe(i + 1, count)}
                className={cn('min-w-[2px] flex-1 rounded-t-[1px]', count > 0 ? 'bg-brand-accent' : 'bg-border-default')}
                style={{ height: count > 0 ? `${Math.max(8, (count / max) * 100)}%` : '4%' }}
              />
            )
          })}
        </div>
        <div className='mt-2 flex justify-between font-mono text-[10px] text-text-muted'>
          <span>Pág. 1</span>
          <span>Pág. {lastPage}</span>
        </div>
      </div>
      <ul className='flex flex-col gap-2'>
        {top.map((p) => (
          <li key={p.page} className='text-body-small text-text-secondary'>
            {describe(p.page, p.count)}
          </li>
        ))}
      </ul>
    </div>
  )
}
