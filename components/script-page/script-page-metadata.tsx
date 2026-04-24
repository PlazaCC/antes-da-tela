import type { TagVariant } from '@/components/tag/tag'
import { Tag } from '@/components/tag/tag'
import { Film } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { RatingBox } from './rating-box'
import { ScriptPageOwnerActions } from './script-page-owner-actions'

interface ScriptPageMetadataProps {
  script: {
    id: string
    title: string
    logline?: string | null
    synopsis?: string | null
    genre?: string | null
    age_rating?: string | null
    author?: {
      id: string
      name: string | null
    } | null
  }
  bannerUrl: string | null
  coverUrl: string | null
  genreVariant: TagVariant
  isOwner: boolean
  currentUserId: string | null
  ratingData: { average: number; total: number } | undefined
  userRating: number | null | undefined
  isRatingPending: boolean
  onRate: (value: number) => void
  onDelete?: () => void
}

export function ScriptPageMetadata({
  script,
  bannerUrl,
  coverUrl,
  genreVariant,
  isOwner,
  currentUserId,
  ratingData,
  userRating,
  isRatingPending,
  onRate,
  onDelete,
}: ScriptPageMetadataProps) {
  const authorLabel = script.author ? (
    <p className='font-mono text-label-mono-default text-text-muted'>
      por{' '}
      <Link
        href={`/profile/${script.author.id}`}
        className='text-text-secondary hover:text-brand-accent transition-colors'>
        {script.author.name ?? 'Autor'}
      </Link>
    </p>
  ) : null

  const actions = isOwner && onDelete ? <ScriptPageOwnerActions scriptId={script.id} onDelete={onDelete} /> : null

  if (bannerUrl) {
    return (
      <div className='flex flex-col gap-3'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-wrap items-center gap-2'>
            {script.genre ? <Tag variant={genreVariant}>{script.genre}</Tag> : null}
            {script.age_rating ? <Tag variant='default'>{script.age_rating}</Tag> : null}
          </div>
          {actions}
        </div>

        {authorLabel}

        <RatingBox
          isOwner={isOwner}
          ratingData={ratingData}
          userRating={userRating}
          isRatingPending={isRatingPending}
          currentUserId={currentUserId}
          onRate={onRate}
        />
      </div>
    )
  }

  return (
    <div className='flex flex-col md:flex-row gap-6 md:gap-8'>
      <div className='w-28 md:w-36 shrink-0 aspect-[4/5] rounded-sm bg-elevated border border-border-subtle overflow-hidden relative shadow-lg'>
        {coverUrl ? (
          <Image src={coverUrl} alt={script.title} fill className='object-cover' />
        ) : (
          <div className='flex flex-col items-center justify-center h-full gap-2'>
            <Film className='w-8 h-8 text-text-muted' />
            <span className='font-mono text-[10px] text-text-muted uppercase'>Sem Capa</span>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-4 flex-1 min-w-0'>
        <div className='flex flex-wrap items-center gap-2'>
          {script.genre ? <Tag variant={genreVariant}>{script.genre}</Tag> : null}
          {script.age_rating ? <Tag variant='default'>{script.age_rating}</Tag> : null}
        </div>

        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='min-w-0'>
            <h1 className='font-display text-heading-2 md:text-heading-1 text-text-primary leading-tight'>
              {script.title}
            </h1>
            {script.logline ? (
              <p className='text-body-large text-text-secondary max-w-3xl mt-2'>{script.logline}</p>
            ) : null}
          </div>
          {actions}
        </div>

        {authorLabel}

        <RatingBox
          isOwner={isOwner}
          ratingData={ratingData}
          userRating={userRating}
          isRatingPending={isRatingPending}
          currentUserId={currentUserId}
          onRate={onRate}
        />
      </div>
    </div>
  )
}
