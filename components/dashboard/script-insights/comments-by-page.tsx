import type { ScriptInsights } from '@/lib/types/script-insights'
import { formatCount } from '@/lib/utils/format-count'
import { PageBars } from './page-bars'

interface CommentsByPageProps {
  byPage: ScriptInsights['comments']['byPage']
  pageCount: number | null
  className?: string
}

export function CommentsByPage({ byPage, pageCount, className }: CommentsByPageProps) {
  if (byPage.length === 0) {
    return <p className='text-body-small text-text-muted'>Ninguém comentou ainda.</p>
  }
  return (
    <PageBars
      counts={byPage}
      pageCount={pageCount}
      ariaLabel='Comentários por página'
      describe={(page, count) => `Página ${page}: ${formatCount(count, 'comentário', 'comentários')}`}
      className={className}
    />
  )
}
