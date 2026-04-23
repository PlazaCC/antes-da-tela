'use client'

import { ScriptMetricsRow } from './row'

interface ScriptsTableProps {
  scripts: Array<{
    id: string
    title: string
    avgRating: number | null
    commentCount: number
    status: string
  }>
  onDeleteClick: (id: string) => void
}

export function ScriptsTable({ scripts, onDeleteClick }: ScriptsTableProps) {
  return (
    <div className='bg-surface border border-border-default rounded-sm overflow-x-auto shadow-sm'>
      {/* Table header */}
      <div className='flex items-center px-5 h-10 bg-elevated/30 border-b border-border-default min-w-[600px]'>
        <span className='flex-1 font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
          Roteiro
        </span>
        <span className='w-[100px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
          Avaliação
        </span>
        <span className='w-[100px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
          Comentários
        </span>
        <span className='w-[120px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em]'>
          Status
        </span>
        <span className='w-[40px] font-mono text-[10px] font-medium text-text-muted uppercase tracking-[0.04em] text-right'>
          Ações
        </span>
      </div>

      {/* Table rows */}
      {scripts.map((script) => (
        <ScriptMetricsRow key={script.id} script={script} onDeleteClick={onDeleteClick} />
      ))}
    </div>
  )
}
