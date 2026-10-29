import { Avatar } from '@/components/avatar'
import { MediaPlayer } from '@/components/interpreter/media-player'
import { Tag } from '@/components/tag/tag'
import { CASTING_STATUS_LABELS } from '@/lib/constants/casting'
import type { CastingTake } from '@/lib/types/casting'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface TakeCardProps {
  take: CastingTake
  actions?: ReactNode
  highlighted?: boolean
  className?: string
}

/** One interpreter's take for a character (A4, E6). */
export function TakeCard({ take, actions, highlighted, className }: TakeCardProps) {
  return (
    <div className={cn('rounded-sm border p-3 flex flex-col gap-3', highlighted ? 'border-brand-accent ring-1 ring-brand-accent' : 'border-border-subtle', className)}>
      <div className='flex items-center gap-2'>
        <Avatar src={take.interpreterImage} name={take.interpreterName || '?'} size='sm' />
        <Link href={`/profile/${take.interpreterId}`} className='text-sm font-medium text-text-primary hover:underline truncate'>
          {take.interpreterName}
        </Link>
        <Tag variant='neutro' className='ml-auto'>
          {CASTING_STATUS_LABELS[take.status]}
        </Tag>
      </div>
      <MediaPlayer src={take.mediaUrl} kind={take.mediaType} />
      {take.note && <p className='text-xs text-text-secondary'>“{take.note}”</p>}
      {actions}
    </div>
  )
}
