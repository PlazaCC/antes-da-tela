import { StarRating } from '@/components/ui/star-rating'
import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import * as React from 'react'

type ScriptCardElement = HTMLAnchorElement | HTMLDivElement

interface ScriptCardBaseProps {
  title: string
  author: string
  genre: string
  rating: number | null
  pages: number | null
  status?: 'publicado' | 'rascunho' | 'privado'
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
  'group flex flex-col gap-4 rounded-sm border border-border-subtle bg-surface p-5 transition-colors hover:border-brand-accent hover:bg-elevated'

const renderContent = ({ title, author, genre, rating, pages, status }: ScriptCardBaseProps) => (
  <>
    <div className='flex items-start justify-between gap-3'>
      <div className='flex flex-col gap-1 min-w-0'>
        <p className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider truncate'>{genre}</p>
        <h3 className='text-heading-3 font-semibold text-text-primary leading-tight line-clamp-2'>{title}</h3>
      </div>
      {status && <Tag variant={status} className='shrink-0 mt-0.5' />}
    </div>

    <div className='flex items-center justify-between gap-3 mt-auto'>
      <span className='text-body-small text-text-secondary truncate'>by {author}</span>
      <span className='font-mono text-label-mono-small text-text-muted shrink-0'>
        {pages != null ? `${pages}p` : '—'}
      </span>
    </div>

    <div className='flex items-center gap-2'>
      <StarRating value={rating ?? 0} readOnly allowHalf />
      <span className='font-mono text-label-mono-small text-text-muted'>
        {rating != null ? rating.toFixed(1) : '—'}
      </span>
    </div>
  </>
)

export const ScriptCard = React.forwardRef<ScriptCardElement, ScriptCardProps>((props, ref) => {
  const { title, author, genre, rating, pages, status, className } = props

  const content = renderContent({ title, author, genre, rating, pages, status })
  const anchorClasses = cn(baseClasses, 'cursor-pointer', className)
  const divClasses = cn(baseClasses, className)

  if ('href' in props && props.href) {
    const { href, className: _className, ...anchorProps } = props as ScriptCardAnchorProps
    void _className

    return (
      <a ref={ref as React.ForwardedRef<HTMLAnchorElement>} href={href} className={anchorClasses} {...anchorProps}>
        {content}
      </a>
    )
  }

  const { className: _className, ...divProps } = props as ScriptCardDivProps
  void _className
  return (
    <div ref={ref as React.ForwardedRef<HTMLDivElement>} className={divClasses} {...divProps}>
      {content}
    </div>
  )
})
ScriptCard.displayName = 'ScriptCard'
