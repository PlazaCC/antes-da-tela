'use client'

import { MediaPlayer } from '@/components/interpreter/media-player'
import { Tag } from '@/components/tag/tag'
import { MODALITY_LABELS } from '@/lib/constants/interpreters'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

interface InterpreterBadgeProps {
  userId: string
  className?: string
}

/** P4 — public profile: approved interpreters show their badge and presentation. */
export function InterpreterBadge({ userId, className }: InterpreterBadgeProps) {
  const trpc = useTRPC()
  const { data: badge } = useQuery(trpc.interpreters.getBadge.queryOptions({ userId }))

  if (!badge) return null

  const roles = badge.modalities.map((m) => MODALITY_LABELS[m]).join(' & ')
  return (
    <section className={cn('bg-surface border-b border-border-default', className)}>
      <div className='max-w-[1280px] mx-auto px-5 md:px-10 py-5 flex flex-col md:flex-row md:items-center gap-4'>
        <Tag variant='importante'>Intérprete · {roles}</Tag>
        <MediaPlayer src={badge.mediaUrl} kind={badge.mediaType} className='md:max-w-[420px]' />
      </div>
    </section>
  )
}
