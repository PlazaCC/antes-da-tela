'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useRef } from 'react'

import { getStorageUrl } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

const PATTERNS: Record<string, string> = {
  diagonal: 'repeating-linear-gradient(135deg,transparent 0 14px,rgba(255,255,255,0.04) 14px 16px)',
  dots: 'radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1.5px)',
  rings: 'radial-gradient(circle at 30% 70%,rgba(255,255,255,0.05) 1px,transparent 2px 18px),radial-gradient(circle at 70% 30%,rgba(255,255,255,0.04) 1px,transparent 2px 22px)',
  wave: 'repeating-linear-gradient(90deg,transparent 0 24px,rgba(255,255,255,0.04) 24px 26px)',
  lines: 'repeating-linear-gradient(0deg,transparent 0 18px,rgba(255,255,255,0.05) 18px 19px)',
}

const CARD_COLORS = [
  'rgb(40,22,18)',
  'rgb(22,18,30)',
  'rgb(18,28,32)',
  'rgb(12,22,24)',
  'rgb(28,24,18)',
  'rgb(32,26,14)',
  'rgb(14,28,24)',
]

const CARD_PATTERNS = ['diagonal', 'dots', 'rings', 'wave', 'lines'] as const

function hashStringToIndex(value: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return modulo === 0 ? 0 : hash % modulo
}

interface FeaturedCardProps {
  id: string
  genre: string
  title: string
  author: string
  pages: number | null
  rating: number | null
  coverUrl: string | null
  color: string
  pattern: keyof typeof PATTERNS
}

function FeaturedCard({ id, genre, title, author, pages, rating, coverUrl, color, pattern }: FeaturedCardProps) {
  return (
    <Link href={`/scripts/${id}`} className='no-underline flex-[0_0_280px] snap-center'>
      <article
        className='land-reveal flex flex-col overflow-hidden rounded-[4px] border bg-[rgb(22,22,22)] transition-[transform_0.3s_ease,border-color_0.3s_ease] cursor-pointer hover:border-[hsl(var(--color-brand-accent))] border-[rgb(37,37,37)]'>
        <div className='relative flex h-[280px] flex-col justify-between overflow-hidden p-4' style={{ background: coverUrl ? undefined : color }}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes='320px'
              className='object-cover'
            />
          ) : (
            <div
              className='absolute inset-0 opacity-35'
              style={{
                backgroundImage: PATTERNS[pattern],
                backgroundSize:
                  pattern === 'dots' ? '14px 14px' : pattern === 'rings' ? '60px 60px' : undefined,
              }}
            />
          )}
          <div className='absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.55)_100%)]' />
          <div className='relative z-[1] flex justify-between'>
            <span className='inline-flex items-center rounded-[2px] border border-[rgba(232,92,47,0.4)] bg-[rgba(232,92,47,0.12)] px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-brand-accent))]'>
              {genre.toUpperCase()}
            </span>
            <span className='font-mono text-[11px] text-[hsl(var(--color-text-primary))]'>
              {pages ? `${pages}p` : '—'}
            </span>
          </div>
          <span className='relative z-[1] font-display text-[24px] leading-[1.05] text-[hsl(var(--color-text-primary))]'>
            {title}
          </span>
        </div>
        <div className='flex flex-col gap-3.5 p-4'>
          <div className='flex items-center justify-between text-[12px]'>
            <span className='font-bold text-[hsl(var(--color-brand-accent))]'>★ {rating ?? '—'}</span>
            <span className='text-[rgb(107,104,96)]'>por {author}</span>
          </div>
          <div className='flex justify-between border-t border-[rgb(37,37,37)] pt-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-[color_0.2s_ease] hover:text-[hsl(var(--color-brand-accent))] text-[hsl(var(--color-text-secondary))]'>
            <span>Leia agora</span>
            <span>→</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export function LandingFeatured() {
  const trackRef = useRef<HTMLDivElement>(null)

  const trpc = useTRPC()
  const { data: recent } = useQuery(trpc.scripts.listRecent.queryOptions({ limit: 7 }))

  const scripts = useMemo(() => recent?.items ?? [], [recent?.items])
  const scriptIds = useMemo(() => scripts.map((s) => s.id), [scripts])

  const { data: ratingsMap } = useQuery({
    ...trpc.ratings.getManyAverage.queryOptions({ scriptIds }),
    enabled: scriptIds.length > 0,
  })

  const scrollBy = (dir: number) => {
    const t = trackRef.current
    if (!t) return
    const card = t.querySelector('article')
    if (!card) return
    t.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20) * 1.2, behavior: 'smooth' })
  }

  return (
    <section id='roteiros' className='border-t border-[rgb(37,37,37)] py-[clamp(80px,10vw,120px)]'>
      <div className='mx-auto max-w-[1280px]'>
        <div className='mb-12 px-[clamp(24px,6vw,80px)]'>
          <div className='land-reveal mb-3'>
            <span className='inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--color-brand-accent))] before:h-[1px] before:w-[28px] before:shrink-0 before:bg-[hsl(var(--color-brand-accent))] before:content-[""]'>
              <span className='mr-1 text-[rgb(107,104,96)]'>05 /</span>
              Em destaque
            </span>
          </div>
          <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8'>
            <h2 className='font-display land-reveal m-0 text-[clamp(36px,5.4vw,80px)] leading-[0.98]' data-delay='1'>
              Roteiros que estão<br /><span className='text-brand-accent italic'>ganhando vida agora.</span>
            </h2>
            <div className='land-reveal flex gap-2' data-delay='2'>
              {[-1, 1].map((dir) => (
                <button key={dir} onClick={() => scrollBy(dir)} aria-label={dir === -1 ? 'Anterior' : 'Próximo'}
                  className='flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(52,52,52)] bg-transparent text-[hsl(var(--color-text-primary))] transition-[background_0.2s_ease,border-color_0.2s_ease,transform_0.2s_ease] hover:bg-[hsl(var(--color-brand-accent))] hover:border-[hsl(var(--color-brand-accent))] hover:-translate-y-[2px]'>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' width={20} height={20}>
                    <path d={dir === -1 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} strokeLinecap='round' />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='relative'>
        <div className='pointer-events-none absolute inset-y-0 right-0 z-[1] w-[80px] bg-[linear-gradient(to_right,transparent,rgb(14,14,14))]' />
        <div
          ref={trackRef}
          className='flex gap-5 px-[clamp(24px,6vw,80px)] overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
          {scripts.map((s) => {
            const indexForStyle = hashStringToIndex(`${s.id}${s.genre ?? ''}`, CARD_COLORS.length)
            const patternIndex = hashStringToIndex(`${s.genre ?? ''}${s.title ?? ''}`, CARD_PATTERNS.length)
            const genre = s.genre ?? 'Roteiro'
            const author = s.author?.name ?? 'Autor'
            const pages = s.script_files?.[0]?.page_count ?? null
            const rating = ratingsMap?.[s.id]?.average ?? null
            const coverUrl = getStorageUrl('avatars', s.cover_path) ?? null

            return (
              <FeaturedCard
                key={s.id}
                id={s.id}
                genre={genre}
                title={s.title}
                author={author}
                pages={pages}
                rating={rating}
                coverUrl={coverUrl}
                color={CARD_COLORS[indexForStyle]!}
                pattern={CARD_PATTERNS[patternIndex]!}
              />
            )
          })}
          <div className='flex flex-[0_0_180px] items-center'>
            <Link
              href='/'
              className='font-display inline-flex items-center gap-2.5 border-b border-[rgb(37,37,37)] pb-1.5 text-[24px] text-[hsl(var(--color-text-primary))] no-underline transition-[color_0.2s_ease,border-color_0.2s_ease] hover:text-[hsl(var(--color-brand-accent))] hover:border-[hsl(var(--color-brand-accent))]'>
              Ver tudo{' '}
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' width={20} height={20}>
                <path d='M5 12h14M13 6l6 6-6 6' strokeLinecap='round' />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
