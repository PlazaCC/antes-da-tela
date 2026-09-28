'use client'

import { useEffect, useState } from 'react'
import { HiwMetricsPreview } from './landing-hiw-metrics'
import { HiwPublishPreview } from './landing-hiw-publish'
import { HiwReadPreview } from './landing-hiw-read'
import { LandingSection } from './landing-section'

const STEPS = [
  {
    n: '01',
    verb: 'Publicar',
    title: 'Publique o roteiro',
    body: 'Envie seu roteiro, adicione apresentação, capa, sinopse e resumo da obra. Organize por gênero, formato e estilo. Registre sua criação em poucos minutos.',
  },
  {
    n: '02',
    verb: 'Conversar',
    title: 'Sublinhe e converse',
    body: 'Leitores descobrem sua história, leem pelo navegador, comentam nas cenas que chamaram atenção e reagem em tempo real. Você acompanha como cada parte está sendo recebida.',
  },
  {
    n: '03',
    verb: 'Descobrir',
    title: 'Descubra e ajude a escolher a história',
    body: 'Veja quantas pessoas abriram seu projeto, até onde chegaram, em que ponto pararam e quais cenas geraram mais reação. Leve essas informações para a indústria.',
  },
]

const ADDR = ['novo-roteiro', 'o-silencio-do-abismo', 'metricas']
const STEP_LABEL = ['Publicar', 'Leitura', 'Métricas']

export function LandingHowItWorks() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setActive((a) => (a + 1) % 3), 7000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <LandingSection
      id="como-funciona"
      tone="dark"
      className="px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1280px]">
        {/* header */}
        <div className="mb-12 lg:mb-16">
          <h2
            className="land-reveal m-0 mb-6 max-w-[16ch] font-display text-[clamp(36px,5.4vw,80px)] leading-[0.98] text-[var(--land-fg)]"
            data-delay="1"
          >
            Da ideia à indústria,
            <br />
            <span className="text-brand-accent">em três passos.</span>
          </h2>
          <p
            className="land-reveal max-w-[560px] text-[clamp(15px,1.2vw,18px)] leading-[1.65] text-[var(--land-fg-2)]"
            data-delay="2"
          >
            Um fluxo curto que conecta criação, público e indústria. Sem
            fricção, sem depender de torcida, com dados reais para sustentar
            cada conversa.
          </p>
        </div>

        {/* layout */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(260px,340px)_1fr]">
          {/* steps */}
          <div className="flex flex-col gap-1 lg:sticky lg:top-[100px]">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative grid grid-cols-[56px_1fr] gap-4 border-t border-[var(--land-border)] bg-transparent px-1 py-[22px] text-left transition-[background_0.25s_ease] ${i === 2 ? 'border-b border-[var(--land-border)]' : ''}`}
              >
                <span
                  className={`font-display text-[42px] leading-none transition-[color_0.3s_ease] ${i === active ? 'text-brand-accent' : 'text-[var(--land-fg-3)]'}`}
                >
                  {s.n}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-accent">
                    {s.verb}
                  </span>
                  <span
                    className={`font-display text-[clamp(17px,1.5vw,21px)] leading-[1.2] transition-[color_0.3s_ease] ${i === active ? 'text-[var(--land-fg)]' : 'text-[var(--land-fg-2)]'}`}
                  >
                    {s.title}
                  </span>
                  {i === active && (
                    <span className="mt-1.5 font-sans text-[13px] leading-[1.55] text-[var(--land-fg-3)]">
                      {s.body}
                    </span>
                  )}
                </div>
                {/* progress bar */}
                <span className="absolute bottom-[-1px] left-0 right-0 h-[1px] overflow-hidden bg-transparent">
                  <span
                    key={`${i}-${active}`}
                    className={`${i === active && !paused ? '[animation:land-hiw-progress_7s_linear_forwards]' : ''} block h-full bg-brand-accent`}
                    style={{
                      width:
                        i < active
                          ? '100%'
                          : i === active && paused
                            ? '60%'
                            : '0%',
                    }}
                  />
                </span>
              </button>
            ))}
          </div>

          {/* preview */}
          <div className="land-reveal overflow-hidden rounded-[6px] border border-[var(--land-border)] bg-[var(--land-card)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3.5 border-b border-[var(--land-border)] bg-[var(--land-card-2)] p-[12px_16px]">
              <div className="flex gap-[6px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-[9px] w-[9px] rounded-full bg-[var(--land-border-strong)]"
                  />
                ))}
              </div>
              <span className="flex-1 font-mono text-[11px] text-[var(--land-fg-3)]">
                antesdatela.app / {ADDR[active]}
              </span>
              <span className="rounded-[2px] border border-brand-accent px-[8px] py-[4px] font-mono text-[10px] uppercase tracking-[0.16em] text-brand-accent">
                {STEP_LABEL[active]}
              </span>
            </div>
            <div className="min-h-[520px] p-7">
              {active === 0 && <HiwPublishPreview />}
              {active === 1 && <HiwReadPreview />}
              {active === 2 && <HiwMetricsPreview />}
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  )
}
