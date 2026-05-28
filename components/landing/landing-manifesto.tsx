'use client'

export function LandingManifesto() {
  return (
    <section
      id='manifesto'
      className='border-t border-[rgb(37,37,37)] px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]'>
      <div
        className='mx-auto grid items-start gap-12 md:gap-20 md:grid-cols-[clamp(140px,200px,200px)_1fr] max-w-[1280px]'>
        <div className='land-reveal md:sticky md:top-[120px]'>
          <span className='inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--color-brand-accent))] before:h-[1px] before:w-[28px] before:shrink-0 before:bg-[hsl(var(--color-brand-accent))] before:content-[""]'>
            <span className='mr-1 text-[rgb(107,104,96)]'>01 /</span>
            Manifesto
          </span>
        </div>

        <div>
          <h2
            className='font-display land-reveal m-0 mb-14 max-w-[16ch] text-[clamp(36px,5.4vw,80px)] leading-[0.98]'>
            De onde vai surgir
            <br />
            <span className='text-brand-accent italic'>a próxima grande história?</span>
          </h2>

          <div
            className='flex flex-col gap-6 text-text-secondary text-[clamp(15px,1.2vw,18px)] leading-[1.65] max-w-[620px]'>
            <p className='land-reveal' data-delay='1'>
              Filmes, séries e jogos originais não aparecem do nada. Antes de chegarem às telas, eles
              começam como ideias, roteiros, personagens, mundos e universos ainda em construção.
            </p>
            <p className='land-reveal' data-delay='2'>
              Mas, entre a criação e a produção, existe um espaço enorme. Criadores muitas vezes não
              conseguem visibilidade. Boas histórias ficam escondidas. E a indústria nem sempre sabe
              onde encontrar aquilo que está procurando.
            </p>
            <p
              className='land-reveal font-display text-text-primary mt-4 border-t border-[rgb(37,37,37)] pt-7 text-[clamp(22px,2.2vw,30px)] leading-[1.25]'
              data-delay='3'>
              O Antes da Tela nasce para aproximar esses mundos.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
