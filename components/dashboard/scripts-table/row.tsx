'use client'

import { ScriptStatusBadge } from '@/components/dashboard/script-status-badge'
import type { DashboardScriptMetrics } from '@/lib/types/scripts'
import Link from 'next/link'
import { ScriptActionsDropdown } from './actions'

interface ScriptMetricsRowProps {
  script: DashboardScriptMetrics
  onDeleteClick: (id: string) => void
}

export function ScriptMetricsRow({ script, onDeleteClick }: ScriptMetricsRowProps) {
  return (
    <div className='flex items-center px-5 h-14 border-b border-border-default last:border-0 hover:bg-elevated transition-colors min-w-[600px]'>
      <div className='flex-1 min-w-0 pr-4'>
        <Link
          href={`/profile/scripts/${script.id}`}
          className='font-sans text-[13px] font-medium text-text-primary hover:text-brand-accent transition-colors truncate block'>
          {script.title}
        </Link>
      </div>
      <span className='w-[100px] font-sans text-[12px] text-brand-accent font-medium'>
        {script.avgRating !== null ? `★ ${script.avgRating.toFixed(1)}` : '--'}
        {script.ratingCount > 0 && <span className='ml-1 text-text-muted'>({script.ratingCount})</span>}
      </span>
      <span className='w-[100px] font-sans text-[12px] text-text-secondary'>{script.commentCount}</span>

      <div className='w-[120px]'>
        <ScriptStatusBadge status={script.status} />
      </div>

      <div className='w-[40px] flex justify-end'>
        <ScriptActionsDropdown scriptId={script.id} onDeleteClick={onDeleteClick} />
      </div>
    </div>
  )
}
