'use client'

const PY = 'clamp(80px,10vw,120px)'
const PX = 'clamp(24px,6vw,80px)'

export function LandingManifesto() {
  return (
    <section
      id='manifesto'
      style={{ padding: `${PY} ${PX}`, borderTop: '1px solid rgb(37,37,37)' }}>
      <div
        className='mx-auto grid gap-20 items-start'
        style={{
          maxWidth: 1280,
          gridTemplateColumns: 'clamp(140px,200px,200px) 1fr',
        }}>
        <div className='land-reveal' style={{ position: 'sticky', top: 120 }}>
          <span className='land-label'>
            <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>01 /</span>
            Manifesto
          </span>
        </div>

        <div>
          <h2
            className='font-display land-reveal'
            style={{ fontSize: 'clamp(36px,5.4vw,80px)', lineHeight: 0.98, margin: '0 0 56px', maxWidth: '14ch' }}>
            De onde vai surgir
            <br />
            <span className='text-brand-accent italic'>a próxima grande história?</span>
          </h2>

          <div
            className='flex flex-col text-text-secondary'
            style={{ gap: 24, fontSize: 'clamp(15px,1.2vw,18px)', lineHeight: 1.65, maxWidth: 620 }}>
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
              className='land-reveal font-display text-text-primary'
              data-delay='3'
              style={{
                fontSize: 'clamp(22px,2.2vw,30px)',
                lineHeight: 1.25,
                marginTop: 16,
                paddingTop: 28,
                borderTop: '1px solid rgb(37,37,37)',
              }}>
              O Antes da Tela nasce para aproximar esses mundos.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
