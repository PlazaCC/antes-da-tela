import { Tag } from '@/components/tag/tag'
import { MODALITY_LABELS } from '@/lib/constants/interpreters'
import type { CallEntry } from '@/lib/types/calls'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface EntryCardProps {
  entry: CallEntry
  /** Defaults to the script page. */
  href?: string
  footer?: ReactNode
  className?: string
}

/** A script entered in a call, with its characters to cast. */
export function EntryCard({ entry, href, footer, className }: EntryCardProps) {
  const { script } = entry
  return (
    <article className={cn('rounded-sm border border-border-default bg-surface p-4 flex gap-4', className)}>
      <div className='relative w-16 h-24 shrink-0 rounded-sm overflow-hidden bg-elevated'>
        {script.coverUrl && <Image src={script.coverUrl} alt='' fill unoptimized className='object-cover' />}
      </div>
      <div className='flex flex-col gap-2 min-w-0 flex-1'>
        <Link href={href ?? `/scripts/${script.id}`} className='font-medium text-text-primary hover:underline'>
          {script.title}
        </Link>
        <p className='text-xs text-text-muted'>
          {script.authorName}
          {script.genre && ` · ${script.genre}`}
        </p>
        {script.logline && <p className='text-body-small text-text-secondary line-clamp-2'>{script.logline}</p>}
        {entry.characters.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {entry.characters.map((c) => (
              <Tag key={c.id} variant='neutro'>
                {c.name} · {c.modalities.map((m) => MODALITY_LABELS[m]).join('/')}
              </Tag>
            ))}
          </div>
        )}
        {footer}
      </div>
    </article>
  )
}
