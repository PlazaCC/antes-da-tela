const PY = 'clamp(100px,12vw,160px)'
const PX = 'clamp(24px,6vw,80px)'

export function LandingFinalCta() {
  return (
    <section
      style={{
        borderTop: '1px solid rgb(37,37,37)',
        padding: `${PY} ${PX}`,
        position: 'relative',
        overflow: 'hidden',
        background: 'rgb(14,14,14)',
        textAlign: 'center',
      }}>

      {/* decorative background text */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          lineHeight: 0.88,
          gap: 0,
          overflow: 'hidden',
        }}>
        {['Antes', 'da Tela'].map((word) => (
          <span
            key={word}
            className='font-display'
            style={{
              fontSize: 'clamp(120px,18vw,240px)',
              color: 'hsl(var(--color-text-primary))',
              opacity: 0.04,
              display: 'block',
              whiteSpace: 'nowrap',
            }}>
            {word}
          </span>
        ))}
      </div>

      <div className='mx-auto' style={{ maxWidth: 900, position: 'relative', zIndex: 1 }}>
        <div className='land-reveal' style={{ marginBottom: 20 }}>
          <span className='land-label'>
            <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>07 /</span>
            Comece agora
          </span>
        </div>

        <h2
          className='font-display land-reveal'
          data-delay='1'
          style={{ fontSize: 'clamp(40px,6.5vw,96px)', lineHeight: 0.96, margin: '0 0 20px' }}>
          Sua história merece<br />
          <span className='text-brand-accent italic'>ser vista.</span>
        </h2>

        <p
          className='font-display land-reveal text-text-secondary'
          data-delay='2'
          style={{ fontSize: 'clamp(24px,3vw,40px)', lineHeight: 1.1, margin: '0 0 48px', fontStyle: 'italic' }}>
          Comece antes da tela.
        </p>

        <div className='land-reveal' data-delay='3' style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href='#lista-de-espera' className='land-btn land-btn-primary'>
            Acesso antecipado <span className='land-arrow'>→</span>
          </a>
          <a href='#roteiros' className='land-btn land-btn-ghost'>
            Ver roteiros
          </a>
        </div>
      </div>
    </section>
  )
}
