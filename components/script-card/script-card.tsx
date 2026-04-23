import { RatingSummary } from '@/components/rating-summary/rating-summary'
import { Tag } from '@/components/tag/tag'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import * as React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ScriptCardElement = HTMLAnchorElement | HTMLDivElement

interface ScriptCardBaseProps {
  title: string
  author: string
  genre: string
  rating: number | null
  ratingTotal?: number
  pages: number | null
  status?: 'publicado' | 'rascunho' | 'privado'
  coverUrl?: string
  onPreview?: () => void
}

type ScriptCardAnchorProps = ScriptCardBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ScriptCardBaseProps> & {
    href: string
  }

type ScriptCardDivProps = ScriptCardBaseProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof ScriptCardBaseProps> & {
    href?: never
  }

export type ScriptCardProps = ScriptCardAnchorProps | ScriptCardDivProps

// ─── Private content component ────────────────────────────────────────────────

function ScriptCardContent({
  title,
  author,
  genre,
  rating,
  ratingTotal,
  pages,
  status,
  coverUrl,
}: ScriptCardBaseProps) {
  return (
    <div className='flex flex-col w-full h-full'>
      <div className='aspect-[2/3] w-full overflow-hidden rounded-sm bg-bg-elevated relative flex items-center justify-center border-b border-border-subtle/50 group-hover:border-brand-accent/30 transition-colors'>
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            width={400}
            height={600}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex flex-col items-center gap-2 opacity-20'>
            <svg
              className='w-12 h-12 text-text-muted'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={1}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <span className='font-mono text-[10px] uppercase tracking-widest font-medium'>Sem Capa</span>
          </div>
        )}
      </div>
      <div className='flex flex-col gap-2 shrink-0 px-4 pb-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex flex-col gap-0.5 min-w-0'>
            {genre && (
              <p className='font-mono text-[10px] text-text-muted uppercase tracking-wider truncate'>{genre}</p>
            )}
            <h3 className='text-body-default font-semibold text-text-primary leading-tight line-clamp-1 group-hover:text-brand-accent transition-colors duration-150'>
              {title}
            </h3>
          </div>
          {status && <Tag variant={status} className='shrink-0' />}
        </div>
        <div className='flex items-center justify-between gap-3 pt-1 border-t border-border-subtle'>
          <span className='text-[11px] text-text-secondary truncate'>por {author}</span>
          <span className='font-mono text-[10px] text-text-muted shrink-0'>{pages != null ? `${pages}p` : ''}</span>
        </div>
        <div className='flex items-center gap-2'>
          <RatingSummary average={rating ?? 0} total={ratingTotal ?? 0} />
        </div>
      </div>
    </div>
  )
}

// ─── Card shell ───────────────────────────────────────────────────────────────

const baseClasses =
  'group flex flex-col gap-3 rounded-sm border border-border bg-surface p-0 transition-all duration-150 hover:border-brand-accent hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base w-full'

export const ScriptCard = React.forwardRef<ScriptCardElement, ScriptCardProps>((props, ref) => {
  // Pull content-only props from the union without intersecting conflicting types.
  // Each branch then casts to the appropriate variant for element-specific spread.
  const { title, author, genre, rating, ratingTotal, pages, status, coverUrl, onPreview } =
    props as ScriptCardBaseProps

  const className = (props as { className?: string }).className

  const content = (
    <ScriptCardContent
      title={title}
      author={author}
      genre={genre}
      rating={rating}
      ratingTotal={ratingTotal}
      pages={pages}
      status={status}
      coverUrl={coverUrl}
      onPreview={onPreview}
    />
  )

  // ── Anchor variant ────────────────────────────────────────────────────────
  if ('href' in props && props.href) {
    const { href, className: _cls, onPreview: _op, title: _t, author: _a, genre: _g,
            rating: _r, ratingTotal: _rt, pages: _p, status: _s, coverUrl: _cv,
            ...htmlAnchorProps } = props as ScriptCardAnchorProps
    void _cls; void _op; void _t; void _a; void _g; void _r; void _rt; void _p; void _s; void _cv
    return (
      <a
        ref={ref as React.ForwardedRef<HTMLAnchorElement>}
        href={href}
        className={cn(baseClasses, 'cursor-pointer', className)}
        {...htmlAnchorProps}>
        {content}
      </a>
    )
  }

  // ── Div (interactive) variant ─────────────────────────────────────────────
  const { className: _cls, onPreview: _op, title: _t, author: _a, genre: _g,
          rating: _r, ratingTotal: _rt, pages: _p, status: _s, coverUrl: _cv,
          ...htmlDivProps } = props as ScriptCardDivProps
  void _cls; void _op; void _t; void _a; void _g; void _r; void _rt; void _p; void _s; void _cv

  return (
    <div
      ref={ref as React.ForwardedRef<HTMLDivElement>}
      className={cn(baseClasses, onPreview && 'cursor-pointer', className)}
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
      {...htmlDivProps}>
      {content}
    </div>
  )
})
ScriptCard.displayName = 'ScriptCard'
