import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as React from 'react'

export interface ScriptCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  author: string
  genre: string
  rating: number
  pages: number
}

export const ScriptCard = React.forwardRef<HTMLDivElement, ScriptCardProps>(
  ({ className, title, author, genre, rating, pages, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group rounded-3xl border border-border bg-surface p-6 transition hover:border-accent hover:bg-elevated',
        className,
      )}
      {...props}>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-sm uppercase tracking-[0.24em] text-muted-foreground'>{genre}</p>
            <h3 className='mt-2 text-xl font-semibold text-foreground'>{title}</h3>
          </div>
          <Badge variant='secondary'>{rating.toFixed(1)} ★</Badge>
        </div>
        <div className='flex items-center justify-between gap-4 text-sm text-secondary-foreground'>
          <span>By {author}</span>
          <span>{pages} pages</span>
        </div>
      </div>
    </div>
  ),
)
ScriptCard.displayName = 'ScriptCard'
