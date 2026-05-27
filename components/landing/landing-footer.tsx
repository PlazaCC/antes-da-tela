'use client'

const PX = 'clamp(24px,6vw,80px)'

const LINKS = [
  {
    heading: 'Plataforma',
    items: ['Como funciona', 'Em destaque', 'Para criadores', 'Para produtores'],
  },
  {
    heading: 'Empresa',
    items: ['Sobre', 'Blog', 'Imprensa', 'Contato'],
  },
  {
    heading: 'Legal',
    items: ['Termos de uso', 'Privacidade', 'Direitos autorais'],
  },
]

export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgb(37,37,37)',
        background: 'rgb(10,10,10)',
        padding: `clamp(48px,7vw,80px) ${PX} 32px`,
      }}>
      <div className='mx-auto' style={{ maxWidth: 1280 }}>

        {/* main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3,1fr)', gap: 48, marginBottom: 64 }}>

          {/* brand column */}
          <div>
            <div className='font-display' style={{ fontSize: 22, color: 'hsl(var(--color-text-primary))', marginBottom: 14, lineHeight: 1 }}>
              Antes da Tela<span style={{ color: 'hsl(var(--color-brand-accent))' }}>.</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgb(107,104,96)', lineHeight: 1.65, maxWidth: 260, margin: '0 0 24px' }}>
              Plataforma de publicação, leitura e descoberta de roteiros audiovisuais brasileiros.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Instagram', 'LinkedIn'].map((s) => (
                <a
                  key={s}
                  href='#'
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgb(107,104,96)',
                    textDecoration: 'none',
                    padding: '5px 10px',
                    border: '1px solid rgb(37,37,37)',
                    borderRadius: 2,
                    transition: 'color 0.2s ease,border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--color-brand-accent))'; e.currentTarget.style.borderColor = 'hsl(var(--color-brand-accent))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(107,104,96)'; e.currentTarget.style.borderColor = 'rgb(37,37,37)' }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgb(107,104,96)', display: 'block', marginBottom: 16 }}>
                {col.heading}
              </span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href='#'
                      style={{ fontSize: 14, color: 'rgb(107,104,96)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--color-text-primary))' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(107,104,96)' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* partnership */}
        <div style={{ borderTop: '1px solid rgb(37,37,37)', paddingTop: 24, marginBottom: 20, textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgb(52,52,52)', letterSpacing: '0.1em' }}>
            uma parceria entre{' '}
            <span style={{ color: 'rgb(107,104,96)' }}>Irmãos de Criação</span>
            {' '}&{' '}
            <span style={{ color: 'rgb(107,104,96)' }}>Plaza Creative Collective</span>
          </span>
        </div>

        {/* bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgb(52,52,52)', letterSpacing: '0.06em' }}>
            © 2026 Antes da Tela. Feito no Brasil com café e roteiros.
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgb(52,52,52)', letterSpacing: '0.1em' }}>
            v 0.1 · em construção
          </span>
        </div>
      </div>
    </footer>
  )
}
