'use client'

const PX = 'clamp(24px, 6vw, 80px)'

export function LandingHero() {
  return (
    <section
      className='relative flex items-center overflow-hidden'
      style={{ minHeight: '100vh', padding: `140px ${PX} 80px` }}>
      {/* grid background */}
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          backgroundImage:
            'linear-gradient(rgb(37,37,37) 1px,transparent 1px),linear-gradient(90deg,rgb(37,37,37) 1px,transparent 1px)',
          backgroundSize: '90px 90px',
          opacity: 0.35,
          maskImage: 'radial-gradient(ellipse at 50% 35%,rgba(0,0,0,.85) 0%,transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 35%,rgba(0,0,0,.85) 0%,transparent 70%)',
        }}
      />

      <div className='relative z-10 w-full' style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className='land-reveal mb-8'>
          <span className='land-label'>
            <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>00 /</span>
            Plataforma de roteiros
          </span>
        </div>

        <h1
          className='font-display m-0 mb-8'
          style={{ fontSize: 'clamp(56px,11.5vw,120px)', lineHeight: 0.92, letterSpacing: '-0.025em' }}>
          <span className='block land-reveal' data-delay='1'>
            Toda grande história
          </span>
          <span
            className='block land-reveal text-brand-accent italic'
            data-delay='2'
            style={{ fontFeatureSettings: '"ss01"' }}>
            começa antes da tela.
          </span>
        </h1>

        <p
          className='land-reveal text-text-secondary'
          data-delay='3'
          style={{ maxWidth: 560, fontSize: 'clamp(15px,1.3vw,19px)', lineHeight: 1.55, marginBottom: 40 }}>
          A plataforma onde histórias, personagens e universos criativos nascem, crescem e se
          aproximam da indústria do entretenimento.
        </p>

        <div className='land-reveal flex gap-3 flex-wrap' data-delay='4'>
          <a href='#roteiros' className='land-btn land-btn-primary'>
            Explorar histórias
            <span className='land-arrow'>→</span>
          </a>
          <a href='#waitlist' className='land-btn land-btn-ghost'>
            Publicar minha história
          </a>
        </div>
      </div>

      {/* scroll indicator */}
      <div
        className='absolute flex flex-col items-center gap-3 z-10'
        style={{
          right: PX,
          bottom: 40,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgb(107,104,96)',
        }}>
        <span>Role</span>
        <div className='land-scroll-line' />
      </div>
    </section>
  )
}
