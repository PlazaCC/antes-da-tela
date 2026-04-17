import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { RatingSummary } from './rating-summary'

type ScriptCardElement = HTMLAnchorElement | HTMLDivElement

interface ScriptCardBaseProps {
  title: string
  author: string
  genre: string
  rating: number | null
  ratingTotal?: number
  pages: number | null
  status?: 'publicado' | 'rascunho' | 'privado'
  onPreview?: () => void
}

type ScriptCardAnchorProps = ScriptCardBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ScriptCardDivProps = ScriptCardBaseProps &
  React.HTMLAttributes<HTMLDivElement> & {
    href?: undefined
  }

export type ScriptCardProps = ScriptCardAnchorProps | ScriptCardDivProps

const baseClasses =
  'group flex flex-col gap-3 rounded-sm border border-border-subtle bg-surface p-5 transition-all duration-150 hover:border-brand-accent hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'

const renderContent = ({ title, author, genre, rating, ratingTotal, pages, status }: ScriptCardBaseProps) => (
  <>
    <div className='flex items-start justify-between gap-3'>
      <div className='flex flex-col gap-1 min-w-0'>
        {genre && (
          <p className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider truncate'>{genre}</p>
        )}
        <h3 className='text-heading-3 font-semibold text-text-primary leading-tight line-clamp-2 group-hover:text-brand-accent transition-colors duration-150'>
          {title}
        </h3>
      </div>
      {status && <Tag variant={status} className='shrink-0 mt-0.5' />}
    </div>

    <div className='flex items-center justify-between gap-3 mt-auto pt-1 border-t border-border-subtle'>
      <span className='text-body-small text-text-secondary truncate'>por {author}</span>
      <span className='font-mono text-label-mono-small text-text-muted shrink-0'>
        {pages != null ? `${pages}p` : ''}
      </span>
    </div>

    <div className='flex items-center gap-2'>
      <RatingSummary average={rating ?? 0} total={ratingTotal ?? 0} />
    </div>
  </>
)

export const ScriptCard = React.forwardRef<ScriptCardElement, ScriptCardProps>((props, ref) => {
  const { title, author, genre, rating, ratingTotal, pages, status, className, onPreview } = props

  const content = renderContent({ title, author, genre, rating, ratingTotal, pages, status })
  const anchorClasses = cn(baseClasses, 'cursor-pointer', className)
  const divClasses = cn(baseClasses, onPreview && 'cursor-pointer', className)

  if ('href' in props && props.href) {
    const {
      href,
      title: _title,
      author: _author,
      genre: _genre,
      rating: _rating,
      ratingTotal: _ratingTotal,
      pages: _pages,
      status: _status,
      className: _className,
      onPreview: _onPreview,
      ...anchorProps
    } = props as ScriptCardAnchorProps & { onPreview?: () => void }
    void _title
    void _author
    void _genre
    void _rating
    void _ratingTotal
    void _pages
    void _status
    void _className
    void _onPreview

    return (
      <a ref={ref as React.ForwardedRef<HTMLAnchorElement>} href={href} className={anchorClasses} {...anchorProps}>
        {content}
      </a>
    )
  }

  const {
    title: _title,
    author: _author,
    genre: _genre,
    rating: _rating,
    ratingTotal: _ratingTotal,
    pages: _pages,
    status: _status,
    className: _className,
    onPreview: _onPreview,
    ...divProps
  } = props as ScriptCardDivProps & { onPreview?: () => void }
  void _title
  void _author
  void _genre
  void _rating
  void _ratingTotal
  void _pages
  void _status
  void _className
  void _onPreview
  return (
    <div
      ref={ref as React.ForwardedRef<HTMLDivElement>}
      className={divClasses}
      onClick={onPreview}
      onKeyDown={
        onPreview
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onPreview()
              }
            }
          : undefined
      }
      role={onPreview ? 'button' : undefined}
      tabIndex={onPreview ? 0 : undefined}
      {...divProps}>
      {content}
    </div>
  )
})
ScriptCard.displayName = 'ScriptCard'
