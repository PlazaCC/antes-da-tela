import { StarRating } from '@/components/star-rating/star-rating'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface RatingBoxProps {
  isOwner: boolean
  ratingData: { average: number; total: number } | undefined
  userRating: number | null | undefined
  isRatingPending: boolean
  currentUserId: string | null
  onRate: (value: number) => void
  className?: string
}

function formatAverage(ratingData: RatingBoxProps['ratingData']) {
  if (!ratingData || ratingData.total === 0) return null
  return ratingData.average.toFixed(1).replace('.', ',')
}

export function RatingBox({
  isOwner,
  ratingData,
  userRating,
  isRatingPending,
  currentUserId,
  onRate,
  className,
}: RatingBoxProps) {
  const average = formatAverage(ratingData)
  const canRate = !!currentUserId && !isOwner
  // Readers see their own score once they rated; everyone else sees the average.
  const starsValue = (canRate ? userRating : null) ?? ratingData?.average ?? 0

  return (
    <div
      className={cn('flex w-fit items-center gap-2', className)}
      title={isOwner ? 'Você não pode avaliar seu próprio roteiro' : undefined}
      aria-live='polite'>
      <StarRating
        value={starsValue}
        size={16}
        allowHalf={!canRate}
        readOnly={!canRate || isRatingPending}
        onChange={onRate}
      />

      <span className='whitespace-nowrap font-mono text-label-mono-small text-text-secondary'>
        {average ? (
          <>
            <span className='text-text-primary'>{average}</span>{' '}
            <span className='text-text-muted'>({ratingData?.total})</span>
          </>
        ) : (
          <span className='text-text-muted'>Sem avaliações</span>
        )}
      </span>

      {!currentUserId ? (
        <Link
          href='/auth/login'
          className='whitespace-nowrap font-mono text-label-mono-small text-brand-accent hover:underline'>
          Avaliar
        </Link>
      ) : null}
      {canRate && !userRating ? (
        <span className='hidden whitespace-nowrap font-mono text-label-mono-small text-text-muted xl:inline'>
          · Dê sua nota
        </span>
      ) : null}
    </div>
  )
}
