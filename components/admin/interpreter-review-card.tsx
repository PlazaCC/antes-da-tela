'use client'

import { MediaPlayer } from '@/components/interpreter/media-player'
import { Tag } from '@/components/tag/tag'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MODALITY_LABELS } from '@/lib/constants/interpreters'
import type { InterpreterForReview } from '@/lib/types/interpreters'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface InterpreterReviewCardProps {
  interpreter: InterpreterForReview
  isReviewing: boolean
  onApprove: () => void
  onReject: (reason: string) => void
  className?: string
}

export function InterpreterReviewCard({ interpreter, isReviewing, onApprove, onReject, className }: InterpreterReviewCardProps) {
  const [reason, setReason] = useState('')
  const details = [
    ['Nascimento', interpreter.birthDate],
    ['Faixa etária', interpreter.ageRange],
    ['Idiomas', interpreter.languages],
    ['DRT', interpreter.drt],
    ['Experiência', interpreter.experience],
  ].filter(([, value]) => !!value)

  return (
    <article className={cn('rounded-sm border border-border-default bg-surface p-5 grid gap-5 md:grid-cols-2', className)}>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <h2 className='font-medium text-text-primary'>{interpreter.displayName || interpreter.name}</h2>
          {interpreter.modalities.map((m) => (
            <Tag key={m} variant='neutro'>
              {MODALITY_LABELS[m]}
            </Tag>
          ))}
        </div>
        <dl className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-body-small'>
          {details.map(([label, value]) => (
            <div key={label} className='contents'>
              <dt className='text-text-muted'>{label}</dt>
              <dd className='text-text-secondary whitespace-pre-line'>{value}</dd>
            </div>
          ))}
        </dl>
        {interpreter.rejectionReason && <p className='text-body-small text-state-error'>Motivo: {interpreter.rejectionReason}</p>}
      </div>
      <div className='flex flex-col gap-3'>
        <MediaPlayer src={interpreter.mediaUrl} kind={interpreter.mediaType} />
        {interpreter.status !== 'approved' && (
          <Button type='button' onClick={onApprove} disabled={isReviewing}>
            Aprovar
          </Button>
        )}
        {interpreter.status !== 'rejected' && (
          <div className='flex flex-col gap-2'>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder='Motivo da reprovação (vai no e-mail para a pessoa)'
              className='bg-elevated border-border-subtle resize-none'
            />
            <Button type='button' variant='outline' onClick={() => onReject(reason)} disabled={isReviewing || !reason.trim()}>
              Reprovar
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
