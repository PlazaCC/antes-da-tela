'use client'

import { useEffect, useRef, useState } from 'react'

const PY = 'clamp(80px,10vw,120px)'
const PX = 'clamp(24px,6vw,80px)'

const FEATURED = [
  { genre: 'Drama',        title: 'O Silêncio do Abismo',  author: 'Maria Lopes',      pages: 98,  rating: 4.6, color: 'rgb(40,22,18)',  pattern: 'diagonal' },
  { genre: 'Thriller',     title: 'Carne Viva',             author: 'João Restier',     pages: 124, rating: 4.4, color: 'rgb(22,18,30)',  pattern: 'dots' },
  { genre: 'Animação',     title: 'Quando o Sol Adormece',  author: 'Pedro Vidal',      pages: 56,  rating: 4.8, color: 'rgb(18,28,32)',  pattern: 'rings' },
  { genre: 'Suspense',     title: 'Maré Baixa',             author: 'Aline Caldeira',   pages: 84,  rating: 4.2, color: 'rgb(12,22,24)',  pattern: 'wave' },
  { genre: 'Documentário', title: 'Cinema de Quintal',      author: 'Luísa Ramos',      pages: 72,  rating: 4.5, color: 'rgb(28,24,18)',  pattern: 'lines' },
  { genre: 'Comédia',      title: 'Ainda Não é Domingo',    author: 'Rafa Bittencourt', pages: 92,  rating: 4.3, color: 'rgb(32,26,14)',  pattern: 'dots' },
  { genre: 'Ficção',       title: 'Última Estação',         author: 'Camila Duarte',    pages: 110, rating: 4.7, color: 'rgb(14,28,24)',  pattern: 'diagonal' },
]

const PATTERNS: Record<string, string> = {
  diagonal: 'repeating-linear-gradient(135deg,transparent 0 14px,rgba(255,255,255,0.04) 14px 16px)',
  dots: 'radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1.5px)',
  rings: 'radial-gradient(circle at 30% 70%,rgba(255,255,255,0.05) 1px,transparent 2px 18px),radial-gradient(circle at 70% 30%,rgba(255,255,255,0.04) 1px,transparent 2px 22px)',
  wave: 'repeating-linear-gradient(90deg,transparent 0 24px,rgba(255,255,255,0.04) 24px 26px)',
  lines: 'repeating-linear-gradient(0deg,transparent 0 18px,rgba(255,255,255,0.05) 18px 19px)',
}

function FeaturedCard({ genre, title, author, pages, rating, color, pattern }: typeof FEATURED[0]) {
  const [hovered, setHovered] = useState(false)
  return (
    <article
      className='land-reveal'
      style={{ flex: '0 0 300px', scrollSnapAlign: 'start', background: 'rgb(22,22,22)', border: `1px solid ${hovered ? 'hsl(var(--color-brand-accent))' : 'rgb(37,37,37)'}`, borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease,border-color 0.3s ease', transform: hovered ? 'translateY(-6px)' : 'none', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ height: 240, position: 'relative', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', background: color }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: PATTERNS[pattern], backgroundSize: pattern === 'dots' ? '14px 14px' : pattern === 'rings' ? '60px 60px' : undefined, opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <span className='land-chip land-chip-accent'>{genre.toUpperCase()}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'hsl(var(--color-text-primary))' }}>{pages}p</span>
        </div>
        <span className='font-display' style={{ fontSize: 24, lineHeight: 1.05, color: 'hsl(var(--color-text-primary))', position: 'relative', zIndex: 1 }}>{title}</span>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: 'hsl(var(--color-brand-accent))', fontWeight: 700 }}>★ {rating}</span>
          <span style={{ color: 'rgb(107,104,96)' }}>por {author}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgb(37,37,37)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: hovered ? 'hsl(var(--color-brand-accent))' : 'hsl(var(--color-text-secondary))', transition: 'color 0.2s ease' }}>
          <span>Leia agora</span>
          <span>→</span>
        </div>
      </div>
    </article>
  )
}

export function LandingFeatured() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const scrollBy = (dir: number) => {
    const t = trackRef.current
    if (!t) return
    const card = t.querySelector('article')
    if (!card) return
    t.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20) * 1.2, behavior: 'smooth' })
  }

  useEffect(() => {
    const t = trackRef.current
    if (!t) return
    const onScroll = () => {
      const card = t.querySelector('article')
      if (!card) return
      setActiveIdx(Math.round(t.scrollLeft / (card.getBoundingClientRect().width + 20)))
    }
    t.addEventListener('scroll', onScroll, { passive: true })
    return () => t.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id='roteiros' style={{ borderTop: '1px solid rgb(37,37,37)', paddingTop: PY, paddingBottom: PY }}>
      <div className='mx-auto' style={{ maxWidth: 1280 }}>
        <div style={{ padding: `0 ${PX}`, marginBottom: 48 }}>
          <div className='land-reveal' style={{ marginBottom: 12 }}>
            <span className='land-label'>
              <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>05 /</span>
              Em destaque
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
            <h2 className='font-display land-reveal' data-delay='1' style={{ fontSize: 'clamp(36px,5.4vw,80px)', lineHeight: 0.98, margin: 0 }}>
              Roteiros que estão<br /><span className='text-brand-accent italic'>ganhando vida agora.</span>
            </h2>
            <div className='land-reveal flex gap-2' data-delay='2'>
              {[-1, 1].map((dir) => (
                <button key={dir} onClick={() => scrollBy(dir)} aria-label={dir === -1 ? 'Anterior' : 'Próximo'}
                  style={{ width: 48, height: 48, border: '1px solid rgb(52,52,52)', borderRadius: '50%', color: 'hsl(var(--color-text-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', transition: 'background 0.2s ease,border-color 0.2s ease,transform 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'hsl(var(--color-brand-accent))'; e.currentTarget.style.borderColor = 'hsl(var(--color-brand-accent))'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgb(52,52,52)'; e.currentTarget.style.transform = 'none' }}>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' width={20} height={20}>
                    <path d={dir === -1 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} strokeLinecap='round' />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '0 0 0 auto', width: 80, background: 'linear-gradient(to right,transparent,rgb(14,14,14))', pointerEvents: 'none', zIndex: 1 }} />
        <div ref={trackRef} className='land-track' style={{ padding: `0 ${PX}` }}>
          {FEATURED.map((f, i) => <FeaturedCard key={i} {...f} />)}
          <div style={{ flex: '0 0 180px', display: 'flex', alignItems: 'center' }}>
            <a href='#' className='font-display' style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 24, color: 'hsl(var(--color-text-primary))', borderBottom: '1px solid rgb(37,37,37)', paddingBottom: 6, textDecoration: 'none', transition: 'color 0.2s ease,border-color 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--color-brand-accent))'; e.currentTarget.style.borderColor = 'hsl(var(--color-brand-accent))' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'hsl(var(--color-text-primary))'; e.currentTarget.style.borderColor = 'rgb(37,37,37)' }}>
              Ver tudo <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' width={20} height={20}><path d='M5 12h14M13 6l6 6-6 6' strokeLinecap='round' /></svg>
            </a>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 32, justifyContent: 'center', padding: `0 ${PX}` }}>
        {FEATURED.map((_, i) => (
          <span key={i} style={{ width: 24, height: 2, background: i === activeIdx ? 'hsl(var(--color-brand-accent))' : 'rgb(52,52,52)', transition: 'background 0.3s ease' }} />
        ))}
      </div>
    </section>
  )
}
