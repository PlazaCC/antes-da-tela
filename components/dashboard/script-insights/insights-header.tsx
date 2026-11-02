import { Button } from '@/components/ui/button'
import { ScriptStatusBadge } from '@/components/dashboard/script-status-badge'
import type { ScriptInsights } from '@/lib/types/script-insights'
import { cn } from '@/lib/utils'
import { formatPublishedDate } from '@/lib/utils/format-date'
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react'
import Link from 'next/link'

interface InsightsHeaderProps {
  script: ScriptInsights['script']
  className?: string
}

export function InsightsHeader({ script, className }: InsightsHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4', className)}>
      <Link
        href='/profile/dashboard'
        className='inline-flex items-center gap-1 self-start text-body-small text-text-muted hover:text-text-primary'>
        <ArrowLeft className='h-4 w-4' /> Dashboard
      </Link>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div className='flex flex-col gap-2'>
          <h1 className='font-display text-[24px] leading-[1.37] text-text-primary'>{script.title}</h1>
          <div className='flex items-center gap-3 text-body-small text-text-muted'>
            <ScriptStatusBadge status={script.status} />
            {script.publishedAt && <span>Publicado em {formatPublishedDate(script.publishedAt)}</span>}
            {script.pageCount && <span>{script.pageCount} páginas</span>}
          </div>
        </div>
        <div className='flex gap-2'>
          <Button asChild variant='outline' size='sm'>
            <Link href={`/publish?id=${script.id}`}>
              <Pencil className='mr-2 h-4 w-4' /> Editar
            </Link>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <Link href={`/scripts/${script.id}`}>
              <ExternalLink className='mr-2 h-4 w-4' /> Página pública
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
