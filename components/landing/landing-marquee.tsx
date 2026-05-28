'use client'

const ITEMS = [
  'Roteiros', 'Séries', 'Universos', 'Personagens', 'Jogos',
  'Documentário', 'Animação', 'Curtas', 'Pilotos', 'Bíblias',
]

export function LandingMarquee() {
  const tripled = [...ITEMS, ...ITEMS, ...ITEMS]
  return (
    <div
      className='group overflow-hidden border-y border-[rgb(37,37,37)] bg-[rgb(14,14,14)] py-[22px]'
      aria-hidden='true'>
      <div
        className='inline-flex font-display italic text-[clamp(22px,3vw,36px)] text-[hsl(var(--color-text-secondary))] [animation:land-marquee_60s_linear_infinite] group-hover:[animation-play-state:paused]'>
        {tripled.map((item, i) => (
          <span key={i} className='inline-flex items-center gap-6 px-6'>
            <span className='text-brand-accent not-italic text-[0.6em]'>
              ✦
            </span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
