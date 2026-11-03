import type { ScriptReadStats } from '@/lib/types/script-reads'
import { formatCount } from '@/lib/utils/format-count'
import { PageBars } from './page-bars'

interface WhereReadersStopProps {
  reads: ScriptReadStats
  pageCount: number | null
  className?: string
}

/** Last page reached by readers who did not finish the script. */
export function WhereReadersStop({ reads, pageCount, className }: WhereReadersStopProps) {
  if (reads.stopPages.length === 0) {
    return (
      <p className='text-body-small text-text-muted'>
        {reads.readers === 0 ? 'Ninguém leu ainda.' : 'Todo mundo que começou chegou até o fim.'}
      </p>
    )
  }
  return (
    <PageBars
      counts={reads.stopPages}
      pageCount={pageCount}
      ariaLabel='Última página lida por quem não terminou'
      describe={(page, count) => `Página ${page}: ${formatCount(count, 'leitor parou', 'leitores pararam')}`}
      className={className}
    />
  )
}
