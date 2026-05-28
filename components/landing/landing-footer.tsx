'use client'

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
      className='border-t border-[rgb(37,37,37)] bg-[rgb(10,10,10)] px-[clamp(24px,6vw,80px)] pb-8 pt-[clamp(48px,7vw,80px)]'>
      <div className='mx-auto max-w-[1280px]'>

        {/* main grid */}
        <div className='grid gap-10 mb-12 md:mb-16 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-12'>

          {/* brand column */}
          <div>
            <div className='font-display text-[22px] leading-none text-[hsl(var(--color-text-primary))] mb-3.5'>
              Antes da Tela<span className='text-[hsl(var(--color-brand-accent))]'>.</span>
            </div>
            <p className='m-0 mb-6 max-w-[260px] text-[13px] leading-[1.65] text-[rgb(107,104,96)]'>
              Plataforma de publicação, leitura e descoberta de roteiros audiovisuais brasileiros.
            </p>
            <div className='flex gap-2.5'>
              {['Instagram', 'LinkedIn'].map((s) => (
                <a
                  key={s}
                  href='#'
                  className='rounded-[2px] border border-[rgb(37,37,37)] px-[10px] py-[5px] font-mono text-[10px] uppercase tracking-[0.12em] text-[rgb(107,104,96)] no-underline transition-[color_0.2s_ease,border-color_0.2s_ease] hover:text-[hsl(var(--color-brand-accent))] hover:border-[hsl(var(--color-brand-accent))]'>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <span className='mb-4 block font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]'>
                {col.heading}
              </span>
              <ul className='flex flex-col gap-2.5 list-none m-0 p-0'>
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href='#'
                      className='text-[14px] text-[rgb(107,104,96)] no-underline transition-[color_0.2s_ease] hover:text-[hsl(var(--color-text-primary))]'>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* partnership */}
        <div className='mb-5 border-t border-[rgb(37,37,37)] pt-6 text-center'>
          <span className='font-mono text-[11px] tracking-[0.1em] text-[rgb(52,52,52)]'>
            uma parceria entre{' '}
            <span className='text-[rgb(107,104,96)]'>Irmãos de Criação</span>
            {' '}&{' '}
            <span className='text-[rgb(107,104,96)]'>Plaza Creative Collective</span>
          </span>
        </div>

        {/* bottom bar */}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <span className='font-mono text-[11px] tracking-[0.06em] text-[rgb(52,52,52)]'>
            © 2026 Antes da Tela. Feito no Brasil com café e roteiros.
          </span>
          <span className='font-mono text-[10px] tracking-[0.1em] text-[rgb(52,52,52)]'>
            v 0.1 · em construção
          </span>
        </div>
      </div>
    </footer>
  )
}
