'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'
import { useState } from 'react'

export interface StarRatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  max?: number
  readOnly?: boolean
  onChange?: (value: number) => void
  allowHalf?: boolean
}

const STAR_POINTS = '10,2 12.59,7.36 18.51,8.09 14,12.26 15.18,18.09 10,15.27 4.82,18.09 6,12.26 1.49,8.09 7.41,7.36'

function StarIcon({ fill, size = 20 }: { fill: 'full' | 'half' | 'empty'; size?: number }) {
  const id = React.useId()
  const clipId = `half-${id}`

  if (fill === 'half') {
    return (
      <svg width={size} height={size} viewBox='0 0 20 20' aria-hidden='true' className='overflow-visible'>
        <defs>
          <clipPath id={clipId}>
            <rect x='0' y='0' width='10' height='20' />
          </clipPath>
        </defs>
        <polygon points={STAR_POINTS} className='fill-border-default' />
        <polygon points={STAR_POINTS} className='fill-brand-accent' clipPath={`url(#${clipId})`} />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox='0 0 20 20' aria-hidden='true'>
      <polygon points={STAR_POINTS} className={fill === 'full' ? 'fill-brand-accent' : 'fill-border-default'} />
    </svg>
  )
}

function getFill(starIndex: number, value: number): 'full' | 'half' | 'empty' {
  if (value >= starIndex + 1) return 'full'
  if (value >= starIndex + 0.5) return 'half'
  return 'empty'
}

export const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ value, max = 5, readOnly = false, onChange, allowHalf = true, className, ...props }, ref) => {
    const [hovered, setHovered] = useState<number | null>(null)

    const displayValue = hovered !== null ? hovered : value

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
      if (readOnly) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      setHovered(allowHalf && x < rect.width / 2 ? starIndex + 0.5 : starIndex + 1)
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>, starIndex: number) => {
      if (readOnly || !onChange) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      onChange(allowHalf && x < rect.width / 2 ? starIndex + 0.5 : starIndex + 1)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, starIndex: number) => {
      if (readOnly || !onChange) return

      const currentValue = hovered ?? value
      const step = allowHalf ? 0.5 : 1

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        onChange(Math.min(currentValue + step, max))
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onChange(Math.max(0, currentValue - step))
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(starIndex + 1)
      }
    }

    return (
      <div
        ref={ref}
        className={cn('flex gap-0.5', className)}
        role='group'
        aria-label={`Rating: ${value} out of ${max} stars`}
        {...props}>
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type='button'
            className={cn(
              'transition-transform duration-100',
              !readOnly && 'hover:scale-110 cursor-pointer',
              readOnly && 'pointer-events-none',
            )}
            onClick={(e) => handleClick(e, i)}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onMouseLeave={() => setHovered(null)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            aria-label={allowHalf ? `${i + 0.5} or ${i + 1} stars` : `${i + 1} star${i === 0 ? '' : 's'}`}
            tabIndex={readOnly ? -1 : 0}>
            <StarIcon fill={getFill(i, displayValue)} size={20} />
          </button>
        ))}
      </div>
    )
  },
)
StarRating.displayName = 'StarRating'
