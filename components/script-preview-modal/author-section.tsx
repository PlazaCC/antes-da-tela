'use client'

import { Avatar } from '@/components/avatar'
import { FollowButton } from '@/components/follow-button'
import { RatingSummary } from '@/components/rating-summary/rating-summary'
import Link from 'next/link'

interface AuthorSectionProps {
  author: {
    id: string
    name: string | null
    image: string | null
    bio: string | null
  } | null
  ratingData: {
    average: number
    total: number
  } | undefined
  onClose: () => void
  className?: string
}

import { cn } from '@/lib/utils'

export function AuthorSection({ author, ratingData, onClose, className }: AuthorSectionProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-4', className)}>
      <div className='flex items-center gap-3'>
        <Avatar src={author?.image} name={author?.name ?? '?'} size='md' />
        <div className='flex flex-col min-w-0 flex-1 md:flex-none'>
          <Link
            href={`/profile/${author?.id}`}
            className='text-body-small font-semibold text-text-primary hover:text-brand-accent transition-colors truncate block'
            onClick={onClose}>
            {author?.name ?? 'Autor desconhecido'}
          </Link>
          {author?.bio && (
            <span className='text-[10px] text-text-muted truncate leading-tight block max-w-[200px] md:max-w-xs'>
              {author.bio}
            </span>
          )}
        </div>
        {author?.id && (
          <div className='ml-auto md:ml-2'>
            <FollowButton authorId={author.id} />
          </div>
        )}
      </div>

      <div className='flex items-center gap-2 shrink-0 md:self-auto border-t md:border-t-0 border-border-subtle pt-3 md:pt-0 w-full md:w-auto md:justify-end'>
        <RatingSummary average={ratingData?.average ?? 0} total={ratingData?.total ?? 0} />
      </div>
    </div>


  )
}
