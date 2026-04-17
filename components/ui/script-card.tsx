import { StarRating } from '@/components/ui/star-rating'
import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import * as React from 'react'

export interface ScriptCardProps extends React.AllHTMLAttributes<HTMLElement> {
  title: string
  author: string
  genre: string
  rating: number
  pages: number
  status?: 'publicado' | 'rascunho' | 'privado'
  href?: string
}

export const ScriptCard = React.forwardRef<HTMLElement, ScriptCardProps>(
  ({ className, title, author, genre, rating, pages, status, href, ...props }, ref) => {
    const Element = href ? 'a' : 'div'

    return (
      <Element
        ref={ref as React.ForwardedRef<any>}
        {...(href ? { href } : {})}
        className={cn(
          'group block flex flex-col gap-4 rounded-sm border border-border-subtle bg-surface p-5 transition-colors',
          'hover:border-brand-accent hover:bg-elevated',
          href && 'cursor-pointer',
          className,
        )}
        {...props}>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex flex-col gap-1 min-w-0'>
            <p className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider truncate'>{genre}</p>
            <h3 className='text-heading-3 font-semibold text-text-primary leading-tight line-clamp-2'>{title}</h3>
          </div>
          {status && <Tag variant={status} className='shrink-0 mt-0.5' />}
        </div>

        <div className='flex items-center justify-between gap-3 mt-auto'>
          <span className='text-body-small text-text-secondary truncate'>by {author}</span>
          <span className='font-mono text-label-mono-small text-text-muted shrink-0'>{pages}p</span>
        </div>

        <div className='flex items-center gap-2'>
          <StarRating value={rating} readOnly allowHalf />
          <span className='font-mono text-label-mono-small text-text-muted'>{rating.toFixed(1)}</span>
        </div>
      </Element>
    )
  },
)
ScriptCard.displayName = 'ScriptCard'
