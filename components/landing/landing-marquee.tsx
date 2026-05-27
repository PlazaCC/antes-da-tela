'use client'

const ITEMS = [
  'Roteiros', 'Séries', 'Universos', 'Personagens', 'Jogos',
  'Documentário', 'Animação', 'Curtas', 'Pilotos', 'Bíblias',
]

export function LandingMarquee() {
  const tripled = [...ITEMS, ...ITEMS, ...ITEMS]
  return (
    <div
      className='land-marquee-wrap overflow-hidden'
      aria-hidden='true'
      style={{
        borderTop: '1px solid rgb(37,37,37)',
        borderBottom: '1px solid rgb(37,37,37)',
        padding: '22px 0',
        background: 'rgb(14,14,14)',
      }}>
      <div
        className='land-marquee-track inline-flex font-display italic'
        style={{ fontSize: 'clamp(22px,3vw,36px)', color: 'hsl(var(--color-text-secondary))' }}>
        {tripled.map((item, i) => (
          <span key={i} className='inline-flex items-center gap-6 px-6'>
            <span className='text-brand-accent not-italic' style={{ fontSize: '0.6em' }}>
              ✦
            </span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
