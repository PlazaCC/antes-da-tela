'use client'

import { SCRIPT_STATUS_BG_CLASSES, SCRIPT_STATUS_LABELS } from '@/lib/constants/scripts'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ScriptActionsDropdown } from './actions'

interface ScriptMetricsRowProps {
  script: {
    id: string
    title: string
    avgRating: number | null
    commentCount: number
    status: string
  }
  onDeleteClick: (id: string) => void
}

export function ScriptMetricsRow({ script, onDeleteClick }: ScriptMetricsRowProps) {
  return (
    <div className='flex items-center px-5 h-14 border-b border-border-default last:border-0 hover:bg-elevated transition-colors min-w-[600px]'>
      <div className='flex-1 min-w-0 pr-4'>
        <Link
          href={`/scripts/${script.id}`}
          className='font-sans text-[13px] font-medium text-text-primary hover:text-brand-accent transition-colors truncate block'>
          {script.title}
        </Link>
      </div>
      <span className='w-[100px] font-sans text-[12px] text-brand-accent font-medium'>
        {script.avgRating !== null ? `★ ${script.avgRating.toFixed(1)}` : '--'}
      </span>
      <span className='w-[100px] font-sans text-[12px] text-text-secondary'>{script.commentCount}</span>

      <div className='w-[120px]'>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border',
            SCRIPT_STATUS_BG_CLASSES[script.status] ?? 'bg-text-muted/5 border-text-muted/20 text-text-muted',
          )}>
          {SCRIPT_STATUS_LABELS[script.status] ?? script.status}
        </span>
      </div>

      <div className='w-[40px] flex justify-end'>
        <ScriptActionsDropdown scriptId={script.id} onDeleteClick={onDeleteClick} />
      </div>
    </div>
  )
}
