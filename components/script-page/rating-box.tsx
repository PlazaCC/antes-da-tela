import { StarRating } from '@/components/star-rating/star-rating'

interface RatingBoxProps {
  isOwner: boolean
  ratingData: { average: number; total: number } | undefined
  userRating: number | null | undefined
  isRatingPending: boolean
  currentUserId: string | null
  onRate: (value: number) => void
}

export function RatingBox({ isOwner, ratingData, userRating, isRatingPending, currentUserId, onRate }: RatingBoxProps) {
  const ratingValue = userRating ?? ratingData?.average ?? 0

  if (isOwner) {
    return (
      <div
        className='flex items-center gap-2 h-[29px] px-2 bg-elevated rounded-sm border border-border-subtle w-fit'
        aria-live='polite'>
        <StarRating value={ratingValue} readOnly allowHalf />
        {ratingData && ratingData.total > 0 ? (
          <span className='font-mono text-label-mono-small text-text-secondary whitespace-nowrap'>
            {ratingData.average.toFixed(1)} <span className='text-text-muted'>({ratingData.total})</span>
          </span>
        ) : null}
        <span className='font-mono text-label-mono-small text-text-muted hidden md:inline'>
          Você não pode avaliar seu próprio roteiro
        </span>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2 h-[29px] px-2 bg-elevated rounded-sm border border-border-subtle w-fit'>
      <StarRating
        value={ratingValue}
        allowHalf={!currentUserId}
        readOnly={!currentUserId || isRatingPending}
        onChange={onRate}
      />
      {ratingData && ratingData.total > 0 ? (
        <span className='font-mono text-label-mono-small text-text-secondary whitespace-nowrap'>
          {ratingData.average.toFixed(1)} <span className='text-text-muted'>({ratingData.total})</span>
        </span>
      ) : null}
      {!currentUserId ? (
        <span className='font-mono text-label-mono-small text-text-muted'>
          <a href='/auth/login' className='text-brand-accent hover:underline'>
            Avaliar
          </a>
        </span>
      ) : null}
    </div>
  )
}
