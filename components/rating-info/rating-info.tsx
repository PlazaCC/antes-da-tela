'use client'

import { StarRating } from '@/components/star-rating/star-rating'
import { cn } from '@/lib/utils'

interface RatingDistribution {
  stars: number
  count: number
  percentage: number
}

interface RatingInfoProps {
  distribution: RatingDistribution[]
  average: number
  total: number
  className?: string
}

export function RatingInfo({ distribution, average, total, className }: RatingInfoProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className='flex items-center gap-6'>
        <div className='flex flex-col'>
          <span className='font-display text-5xl text-text-primary leading-none'>{average.toFixed(1)}</span>
          <div className='mt-2'>
            <StarRating value={average} readOnly allowHalf size={16} />
          </div>
          <span className='font-mono text-[10px] text-text-muted uppercase mt-1'>
            {total} {total === 1 ? 'Avaliação' : 'Avaliações'}
          </span>
        </div>

        <div className='flex-1 flex flex-col gap-2'>
          {distribution.map((item) => (
            <div key={item.stars} className='flex items-center gap-3'>
              <span className='font-mono text-[10px] text-text-muted w-3'>{item.stars}</span>
              <div className='flex-1 h-1.5 bg-border-default rounded-full overflow-hidden'>
                <div
                  className='h-full bg-brand-accent transition-all duration-500'
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className='font-mono text-[10px] text-text-muted w-8 text-right'>
                {Math.round(item.percentage)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
