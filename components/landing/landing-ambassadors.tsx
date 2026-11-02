import { AMBASSADORS } from '@/content/embaixadores'
import Image from 'next/image'
import Link from 'next/link'
import { LandingSection } from './landing-section'
import { LandingSupporters } from './landing-supporters'

export function LandingAmbassadors() {
  return (
    <LandingSection
      id="embaixadores"
      tone="dark"
      className="px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <span
              className="land-reveal font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-brand-blue"
              data-delay="1"
            >
              Embaixadores
            </span>
            <h2
              className="land-reveal m-0 font-display text-[clamp(36px,5.4vw,80px)] leading-[0.98] text-[var(--land-fg)]"
              data-delay="1"
            >
              Quem lê roteiro
              <br />
              antes de todo mundo.
            </h2>
          </div>
          <p
            className="land-reveal m-0 max-w-[400px] text-[15px] leading-[1.65] text-[var(--land-fg-2)]"
            data-delay="2"
          >
            Roteiristas, produtores e curadores do mercado audiovisual que
            apoiam o Antes da Tela.
          </p>
        </div>

        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:gap-6 lg:grid-cols-4">
          {AMBASSADORS.map((ambassador, i) => (
            <li key={ambassador.slug} className="land-reveal" data-delay={String((i % 4) + 1)}>
              <Link
                href="/embaixadores"
                className="group flex flex-col gap-3 no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-[var(--land-card)]">
                  <Image
                    src={ambassador.photo}
                    alt={`Foto de ${ambassador.name}`}
                    fill
                    sizes="(min-width: 1024px) 300px, 45vw"
                    className="object-cover grayscale transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </span>
                <span className="font-display text-[clamp(18px,2vw,24px)] leading-[1.1] text-[var(--land-fg)]">
                  {ambassador.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--land-fg-3)]">
                  {ambassador.role}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="land-reveal mt-12 flex justify-center md:mt-16" data-delay="2">
          <Link
            href="/embaixadores"
            className="group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] border border-[var(--land-border-strong)] px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[var(--land-fg)] no-underline transition-[transform_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease] hover:-translate-y-[2px] hover:border-brand-blue hover:text-brand-blue"
          >
            Conheça os embaixadores{' '}
            <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
              →
            </span>
          </Link>
        </div>

        <LandingSupporters />
      </div>
    </LandingSection>
  )
}
