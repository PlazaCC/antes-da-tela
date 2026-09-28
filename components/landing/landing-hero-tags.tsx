const TAGS = [
  'Roteiros',
  'Séries',
  'Universos',
  'Personagens',
  'Jogos',
  'Documentário',
  'Animação',
  'Curtas',
  'Pilotos',
  'Bíblias',
]

/**
 * Decorative cinema film strip that scrolls under the hero.
 *
 * The band is shorter than the clipping window and vertically centered, so the
 * whole rotated ribbon — both diagonal edges — stays visible without leaving a
 * gap against the section boundary.
 * No sprocket holes.
 */
export function LandingHeroTags() {
  const tripled = [...TAGS, ...TAGS, ...TAGS]

  return (
    <div
      aria-hidden="true"
      className="relative h-[160px] w-full overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 w-[130%] -translate-x-1/2 -translate-y-1/2 -rotate-1">
        <div className="flex w-max bg-[rgba(255,255,255,0.02)] [animation:land-marquee_60s_linear_infinite]">
          {tripled.map((tag, i) => (
            <div
              key={`${tag}-${i}`}
              className="flex h-[120px] w-[180px] shrink-0 items-center justify-center border-y border-r border-[var(--land-border)] px-2 text-center font-display text-2xl text-[var(--land-fg-3)]"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
