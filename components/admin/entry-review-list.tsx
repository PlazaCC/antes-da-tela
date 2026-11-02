'use client'

import { EntryCard } from '@/components/calls/entry-card'
import { Tag, type TagVariant } from '@/components/tag/tag'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CallEntry } from '@/lib/types/calls'
import { useState } from 'react'

const STATUS: Record<CallEntry['status'], { label: string; variant: TagVariant }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  approved: { label: 'Aprovada', variant: 'success' },
  rejected: { label: 'Recusada', variant: 'error' },
}

interface EntryReviewListProps {
  entries: CallEntry[]
  isSaving: boolean
  onReview: (entryId: string, decision: 'approved' | 'rejected', reason?: string) => void
}

/** A3 — approve or refuse the scripts entered in a call. */
export function EntryReviewList({ entries, isSaving, onReview }: EntryReviewListProps) {
  const [reasons, setReasons] = useState<Record<string, string>>({})

  if (entries.length === 0) return <p className='text-body-small text-text-muted'>Nenhuma inscrição ainda.</p>

  return (
    <div className='flex flex-col gap-4'>
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          footer={
            <div className='flex flex-col gap-2 pt-1'>
              <Tag variant={STATUS[entry.status].variant} className='self-start'>
                {STATUS[entry.status].label}
              </Tag>
              <div className='flex flex-wrap gap-2'>
                {entry.status !== 'approved' && (
                  <Button size='sm' disabled={isSaving} onClick={() => onReview(entry.id, 'approved')}>
                    Aprovar
                  </Button>
                )}
                {entry.status !== 'rejected' && (
                  <>
                    <Input
                      value={reasons[entry.id] ?? ''}
                      onChange={(e) => setReasons((r) => ({ ...r, [entry.id]: e.target.value }))}
                      placeholder='Motivo da recusa'
                      className='h-8 max-w-[240px] text-xs'
                    />
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={isSaving || !reasons[entry.id]?.trim()}
                      onClick={() => onReview(entry.id, 'rejected', reasons[entry.id])}>
                      Recusar
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        />
      ))}
    </div>
  )
}
