import Image from 'next/image'
import Link from 'next/link'

const PATTERNS: Record<string, string> = {
  diagonal:
    'repeating-linear-gradient(135deg,transparent 0 14px,rgba(255,255,255,0.04) 14px 16px)',
  dots: 'radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1.5px)',
  rings:
    'radial-gradient(circle at 30% 70%,rgba(255,255,255,0.05) 1px,transparent 2px 18px),radial-gradient(circle at 70% 30%,rgba(255,255,255,0.04) 1px,transparent 2px 22px)',
  wave: 'repeating-linear-gradient(90deg,transparent 0 24px,rgba(255,255,255,0.04) 24px 26px)',
  lines:
    'repeating-linear-gradient(0deg,transparent 0 18px,rgba(255,255,255,0.05) 18px 19px)',
}

export const CARD_COLORS = [
  'rgb(40,22,18)',
  'rgb(22,18,30)',
  'rgb(18,28,32)',
  'rgb(12,22,24)',
  'rgb(28,24,18)',
  'rgb(32,26,14)',
  'rgb(14,28,24)',
]

export const CARD_PATTERNS = [
  'diagonal',
  'dots',
  'rings',
  'wave',
  'lines',
] as const

export function hashStringToIndex(value: string, modulo: number) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return modulo === 0 ? 0 : hash % modulo
}

export interface FeaturedCardProps {
  id: string
  genre: string
  title: string
  author: string
  rating: number | null
  coverUrl: string | null
  color: string
  pattern: keyof typeof PATTERNS
}

/**
 * Poster-style script card. Self-contained dark surface so it reads on the
 * cream "Roteiros" section without inheriting the section palette.
 */
export function FeaturedCard({
  id,
  genre,
  title,
  author,
  rating,
  coverUrl,
  color,
  pattern,
}: FeaturedCardProps) {
  return (
    <Link
      href={`/scripts/${id}`}
      className="flex-[0_0_280px] snap-center no-underline"
    >
      <article className="flex h-full cursor-pointer flex-col rounded-[4px] border border-[#2a2a2a] bg-[#1e1e1e] transition-[transform_0.3s_ease,border-color_0.3s_ease] hover:border-brand-accent">
        <div
          className="relative flex h-[280px] flex-col justify-end p-4"
          style={{ background: coverUrl ? undefined : color }}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="320px"
              className="object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage: PATTERNS[pattern],
                backgroundSize:
                  pattern === 'dots'
                    ? '14px 14px'
                    : pattern === 'rings'
                      ? '60px 60px'
                      : undefined,
              }}
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
          <span className="relative z-[1] mb-2 inline-flex w-fit items-center rounded-[2px] border border-white/25 bg-black/40 px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
            {genre}
          </span>
          <span className="relative z-[1] font-display text-[24px] leading-[1.05] text-[#fff3d2]">
            {title}
          </span>
        </div>
        <div className="flex flex-col gap-3.5 p-4">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-bold text-brand-accent">
              ★ {rating ?? '—'}
            </span>
            <span className="text-[#999383]">por {author}</span>
          </div>
          <div className="flex justify-between border-t border-[#2a2a2a] pt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#cac5b8] transition-[color_0.2s_ease] hover:text-brand-accent">
            <span>Leia agora</span>
            <span>→</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
