import { LEGAL_TABS } from '@/content/legal/legal-tabs'
import Image from 'next/image'
import Link from 'next/link'
import { PlazaCredit } from './plaza-credit'

const LEGAL_LINKS = Object.values(LEGAL_TABS).map((tab) => ({
  label: tab.navLabel,
  href: `/legal/${tab.slug}`,
}))

const LINKS: { heading: string; items: { label: string; href: string }[] }[] = [
  {
    heading: 'Plataforma',
    items: [
      { label: 'Explorar', href: '/feed' },
      { label: 'Publicar roteiro', href: '/publish' },
      { label: 'Meus roteiros', href: '/profile/scripts' },
      { label: 'Configurações', href: '/profile/edit' },
    ],
  },
  {
    heading: 'Legal',
    items: LEGAL_LINKS,
  },
]

export function Footer() {
  return (
    <footer
      aria-label="Rodapé"
      className="border-t border-[rgb(37,37,37)] bg-[rgb(10,10,10)] px-[clamp(24px,6vw,80px)] pb-8 pt-[clamp(48px,7vw,80px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* main grid */}
        <div className="mb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(2,1fr)] lg:gap-12">
          {/* brand column */}
          <div>
            <div className="mb-3.5">
              <Image
                src="/logo-white.svg"
                alt="Antes da Tela"
                className="h-8 w-auto max-w-full md:h-9"
                width={475}
                height={87}
              />
            </div>
            <p className="m-0 mb-6 max-w-[260px] text-[13px] leading-[1.65] text-[rgb(107,104,96)]">
              Plataforma de publicação, leitura e descoberta de roteiros
              audiovisuais brasileiros.
            </p>
          </div>

          {/* link columns */}
          {LINKS.map((col) => (
            <div key={col.heading}>
              <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]">
                {col.heading}
              </span>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-[rgb(107,104,96)] no-underline transition-[color_0.2s_ease] hover:text-[hsl(var(--color-text-primary))]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <PlazaCredit />

        {/* bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] tracking-[0.06em] text-[rgb(52,52,52)]">
            © 2026 Antes da Tela
          </span>
          <span className="font-mono text-[10px] tracking-[0.1em] text-[rgb(52,52,52)]">
            v 0.1 · em construção
          </span>
        </div>
      </div>
    </footer>
  )
}
