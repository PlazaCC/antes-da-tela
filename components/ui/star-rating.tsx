import { cn } from '@/lib/utils'
import * as React from 'react'

export interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  readOnly?: boolean
  onChange?: (value: number) => void
}

export const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ value, max = 5, readOnly = false, onChange, className, ...props }, ref) => {
    const handleClick = (i: number) => {
      if (!readOnly && onChange) onChange(i + 1)
    }
    return (
      <div ref={ref} className={cn('flex gap-1', className)} {...props}>
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type='button'
            className={cn(
              'text-yellow-400 transition-colors',
              i < value ? 'fill-yellow-400' : 'fill-muted-foreground',
              readOnly && 'pointer-events-none opacity-60',
            )}
            onClick={() => handleClick(i)}
            aria-label={`Avaliar com ${i + 1} estrela${i === 0 ? '' : 's'}`}
            tabIndex={readOnly ? -1 : 0}>
            <svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
              <polygon points='10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.09 10,15.27 4.82,18.09 6,12.26 1.49,8.09 7.41,7.36' />
            </svg>
          </button>
        ))}
      </div>
    )
  },
)
StarRating.displayName = 'StarRating'
