'use client'

import { Tag, type TagVariant } from '@/components/tag/tag'
import { formatAgeRating } from '@/lib/constants/scripts'
import type { AgeRating } from '@/lib/constants/scripts'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { RatingBox } from './rating-box'
import { ScriptPageOwnerActions } from './script-page-owner-actions'

interface ScriptReadingBarProps {
  scriptId: string
  title: string
  author?: { id: string; name: string | null } | null
  genre?: string | null
  genreVariant: TagVariant
  subgenres?: string[] | null
  ageRating?: string | null
  isOwner: boolean
  currentUserId: string | null
  ratingData: { average: number; total: number } | undefined
  userRating: number | null | undefined
  isRatingPending: boolean
  onRate: (value: number) => void
  onDelete?: () => void
  pitchDeckUrl: string | null
  onOpenPitchDeck: () => void
}

/** Compact header for the reading view — focus stays on the script + comments. */
export function ScriptReadingBar({
  scriptId,
  title,
  author,
  genre,
  genreVariant,
  subgenres,
  ageRating,
  isOwner,
  currentUserId,
  ratingData,
  userRating,
  isRatingPending,
  onRate,
  onDelete,
  pitchDeckUrl,
  onOpenPitchDeck,
}: ScriptReadingBarProps) {
  return (
    <div className='border-b border-border-subtle bg-bg-base'>
      <div className='max-w-6xl mx-auto w-full px-5 py-4 flex flex-col gap-3'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <h1 className='font-display text-heading-3 md:text-heading-2 text-text-primary leading-tight truncate'>
              {title}
            </h1>
            {author ? (
              <p className='font-mono text-label-mono-small text-text-muted mt-1'>
                por{' '}
                <Link
                  href={`/profile/${author.id}`}
                  className='text-text-secondary hover:text-brand-accent transition-colors'>
                  {author.name ?? 'Autor'}
                </Link>
              </p>
            ) : null}
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            {pitchDeckUrl ? (
              <button
                onClick={onOpenPitchDeck}
                className='inline-flex items-center gap-2 px-3 py-2 rounded-sm border border-border-subtle bg-surface hover:bg-elevated transition-colors text-body-small text-text-secondary hover:text-text-primary'>
                <FileText size={15} className='text-brand-accent' />
                <span className='hidden sm:inline'>Ver Pitch Deck</span>
              </button>
            ) : null}
            {isOwner && onDelete ? <ScriptPageOwnerActions scriptId={scriptId} onDelete={onDelete} /> : null}
          </div>
        </div>

        {(genre || (subgenres && subgenres.length > 0) || ageRating) && (
          <div className='flex flex-wrap items-center gap-2'>
            {genre ? <Tag variant={genreVariant}>{genre}</Tag> : null}
            {subgenres?.map((sub) => (
              <Tag key={sub} variant='default'>
                {sub}
              </Tag>
            ))}
            {ageRating ? <Tag variant='default'>{formatAgeRating(ageRating as AgeRating)}</Tag> : null}
          </div>
        )}

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
