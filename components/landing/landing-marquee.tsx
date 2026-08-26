'use client'

const ITEMS = [
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

/** SVG de furo de fita de cinema (sprocket hole) */
const SPROCKET = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='8'%3E%3Crect x='12' y='0' width='16' height='8' rx='3' fill='%23252525'/%3E%3C/svg%3E")`

export function LandingMarquee() {
  const tripled = [...ITEMS, ...ITEMS, ...ITEMS]
  return (
    <div
      className="group absolute z-0 -rotate-1 overflow-hidden bg-[rgb(14,14,14)] opacity-40"
      aria-hidden="true"
    >
      {/*
        Toda a fita anima como um bloco único —
        furos e quadros rodam sincronizados.
      */}
      <div className="inline-flex flex-col [animation:land-marquee_60s_linear_infinite]">
        {/* ── Fileira superior de furos ── */}
        <div
          className="h-[8px] bg-[rgb(14,14,14)]"
          style={{
            backgroundImage: SPROCKET,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '40px 8px',
          }}
        />

        {/* ── Quadros ── */}
        <div className="my-1.5 flex divide-x-2 divide-[rgb(37,37,37)] border-2 border-[rgb(37,37,37)] bg-[rgb(18,18,18)]">
          {tripled.map((item, i) => (
            <div
              key={i}
              className="flex h-[132px] w-[180px] shrink-0 items-center justify-center px-2 text-center font-display text-2xl text-[hsl(var(--color-text-secondary))]/20"
            >
              {item}
            </div>
          ))}
        </div>

        {/* ── Fileira inferior de furos ── */}
        <div
          className="h-[8px] bg-[rgb(14,14,14)]"
          style={{
            backgroundImage: SPROCKET,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '40px 8px',
          }}
        />
      </div>
    </div>
  )
}
