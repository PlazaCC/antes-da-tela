'use client'

import { Avatar } from '@/components/avatar'
import { FollowButton } from '@/components/follow-button'
import { RatingSummary } from '@/components/ui/rating-summary'
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
}

export function AuthorSection({ author, ratingData, onClose }: AuthorSectionProps) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <Avatar src={author?.image} name={author?.name ?? '?'} size='md' />
        <div className='flex flex-col min-w-0'>
          <Link
            href={`/profile/${author?.id}`}
            className='text-body-small font-medium text-text-primary hover:text-brand-accent transition-colors truncate'
            onClick={onClose}>
            {author?.name ?? 'Autor desconhecido'}
          </Link>
          {author?.bio && (
            <span className='text-[10px] text-text-muted truncate leading-tight'>
              {author.bio}
            </span>
          )}
        </div>
        {author?.id && (
          <div className='ml-2'>
            <FollowButton authorId={author.id} />
          </div>
        )}
      </div>

      <div className='flex items-center gap-2 shrink-0'>
        <RatingSummary average={ratingData?.average ?? 0} total={ratingData?.total ?? 0} />
      </div>
    </div>
  )
}
