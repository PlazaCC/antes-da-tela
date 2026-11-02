import type { ScriptInsights } from '@/lib/types/script-insights'
import { formatCount } from '@/lib/utils/format-count'
import { cn } from '@/lib/utils'

interface CommentsByPageProps {
  byPage: ScriptInsights['comments']['byPage']
  pageCount: number | null
  className?: string
}

const TOP_PAGES = 3

/** One bar per page, height by number of comments, plus the most discussed pages. */
export function CommentsByPage({ byPage, pageCount, className }: CommentsByPageProps) {
  if (byPage.length === 0) {
    return <p className='text-body-small text-text-muted'>Ninguém comentou ainda.</p>
  }

  const counts = new Map(byPage.map((p) => [p.page, p.count]))
  const lastPage = Math.max(pageCount ?? 0, ...byPage.map((p) => p.page))
  const max = Math.max(...byPage.map((p) => p.count))
  const top = [...byPage].sort((a, b) => b.count - a.count || a.page - b.page).slice(0, TOP_PAGES)

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div className='flex h-24 items-end gap-px' role='img' aria-label='Comentários por página'>
        {Array.from({ length: lastPage }, (_, i) => {
          const count = counts.get(i + 1) ?? 0
          return (
            <div
              key={i}
              title={`Página ${i + 1}: ${formatCount(count, 'comentário', 'comentários')}`}
              className={cn('min-w-[2px] flex-1 rounded-t-[1px]', count > 0 ? 'bg-brand-accent' : 'bg-border-default')}
              style={{ height: count > 0 ? `${Math.max(8, (count / max) * 100)}%` : '4%' }}
            />
          )
        })}
      </div>
      <div className='flex justify-between font-mono text-[10px] text-text-muted'>
        <span>Pág. 1</span>
        <span>Pág. {lastPage}</span>
      </div>
      <ul className='flex flex-col gap-2'>
        {top.map((p) => (
          <li key={p.page} className='flex justify-between text-body-small'>
            <span className='text-text-secondary'>Página {p.page}</span>
            <span className='text-text-primary'>{formatCount(p.count, 'comentário', 'comentários')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
