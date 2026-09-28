'use client'

import { LANDING_PILLARS, NOT_A_LIST } from './landing-pillars-data'
import { LandingSection } from './landing-section'

export function LandingPillars() {
  return (
    <LandingSection
      id="plataforma"
      tone="cream"
      className="px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* header */}
        <div className="mb-16 md:mb-20">
          <h2
            className="land-reveal m-0 mb-8 max-w-[16ch] font-display text-[clamp(36px,5.4vw,80px)] leading-[0.98] text-[var(--land-fg)]"
            data-delay="1"
          >
            Um <span className="text-brand-accent">novo tipo</span> de
            plataforma.
          </h2>
          <div className="land-reveal mb-7 flex flex-col gap-2" data-delay="2">
            {NOT_A_LIST.map((t) => (
              <span
                key={t}
                className="relative pl-5 font-display text-[clamp(18px,1.6vw,22px)] text-[var(--land-fg-3)]"
              >
                <span className="absolute left-0 font-bold not-italic text-brand-accent">
                  ×
                </span>
                {t}
              </span>
            ))}
          </div>
          <p
            className="land-reveal max-w-[640px] text-[clamp(15px,1.2vw,18px)] leading-[1.65] text-[var(--land-fg-2)]"
            data-delay="3"
          >
            É um ambiente feito para que histórias ganhem vida antes de chegar à
            produção. Um lugar onde criadores publicam, recebem retorno do
            público, e acompanham dados que ajudam a entender o potencial de
            cada projeto.
          </p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {LANDING_PILLARS.map((p, i) => (
            <article
              key={p.verb}
              data-delay={i + 1}
              className="land-reveal group flex cursor-default flex-col gap-3 rounded-[2px] bg-brand-blue p-6 transition-[background_0.3s_ease] hover:bg-[#1a66c2]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">
                  {p.verb}
                </span>
                <span className="h-[28px] w-[28px] text-white/90 transition-[color_0.3s_ease,transform_0.3s_ease] group-hover:scale-110">
                  {p.icon}
                </span>
              </div>
              <h3 className="m-0 font-display text-[clamp(20px,1.8vw,24px)] leading-[1.15] text-white">
                {p.title}
              </h3>
              <p className="text-[14px] leading-[1.6] text-[#dceafb]">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </LandingSection>
  )
}
