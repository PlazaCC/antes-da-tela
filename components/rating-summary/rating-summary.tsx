import { StarRating } from '@/components/star-rating/star-rating'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface RatingSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  average: number
  total?: number
  max?: number
}

export function RatingSummary({ average, total = 0, max = 5, className, ...props }: RatingSummaryProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} {...props}>
      <StarRating value={average} readOnly allowHalf />
      <span className='font-mono text-label-mono-small text-text-muted'>
        {average.toFixed(1)}/{max}
      </span>
      {total > 0 && (
        <span className='text-body-small text-text-muted'>
          ({total} {total === 1 ? 'avaliação' : 'avaliações'})
        </span>
      )}
    </div>
  )
}
