'use client'

import { useEffect, useState } from 'react'
import { HiwMetricsPreview } from './landing-hiw-metrics'
import { HiwPublishPreview } from './landing-hiw-publish'
import { HiwReadPreview } from './landing-hiw-read'

const STEPS = [
  { n: '01', verb: 'Publique', title: 'Publique sua história', body: 'Envie seu roteiro, adicione apresentação, capa, sinopse e resumo da obra. Organize por gênero, formato e estilo. Registre sua criação em poucos minutos.' },
  { n: '02', verb: 'Compartilhe', title: 'O público encontra e participa', body: 'Leitores descobrem sua história, leem pelo navegador, comentam nas cenas que chamaram atenção e reagem em tempo real. Você acompanha como cada parte está sendo recebida.' },
  { n: '03', verb: 'Acompanhe', title: 'Dados que ajudam a contar sua história', body: 'Veja quantas pessoas abriram seu projeto, até onde chegaram, em que ponto pararam e quais cenas geraram mais reação. Leve essas informações para a indústria.' },
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
    <section
      id='como-funciona'
      className='border-t border-[rgb(37,37,37)] bg-[radial-gradient(ellipse_at_20%_0%,rgba(232,92,47,0.06),transparent_50%),rgb(14,14,14)] px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className='mx-auto max-w-[1280px]'>
        {/* header */}
        <div className='mb-12 lg:mb-16'>
          <h2
            className='font-display land-reveal m-0 mb-6 max-w-[16ch] text-[clamp(36px,5.4vw,80px)] leading-[0.98]'
            data-delay='1'>
            Da ideia à indústria,
            <br />
            <span className='text-brand-accent italic'>em três passos.</span>
          </h2>
          <p
            className='land-reveal text-text-secondary max-w-[560px] text-[clamp(15px,1.2vw,18px)] leading-[1.65]'
            data-delay='2'>
            Um fluxo curto que conecta criação, público e indústria. Sem fricção, sem depender de
            torcida, com dados reais para sustentar cada conversa.
          </p>
        </div>

        {/* layout */}
        <div className='grid items-start gap-10 lg:grid-cols-[minmax(260px,340px)_1fr]'>
          {/* steps */}
          <div className='flex flex-col gap-1 lg:sticky lg:top-[100px]'>
            {STEPS.map((s, i) => (
              <button key={i}
                onClick={() => setActive(i)}
                className={`relative grid grid-cols-[56px_1fr] gap-4 border-t border-[rgb(37,37,37)] bg-transparent px-1 py-[22px] text-left transition-[background_0.25s_ease] ${i === 2 ? 'border-b border-[rgb(37,37,37)]' : ''}`}
              >
                <span className={`font-display text-[42px] leading-none transition-[color_0.3s_ease] ${i === active ? 'text-[hsl(var(--color-brand-accent))]' : 'text-[rgb(107,104,96)]'}`}>
                  {s.n}
                </span>
                <div className='flex flex-col gap-1.5'>
                  <span className='font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--color-brand-accent))]'>{s.verb}</span>
                  <span className={`font-display text-[clamp(17px,1.5vw,21px)] leading-[1.2] transition-[color_0.3s_ease] ${i === active ? 'text-[hsl(var(--color-text-primary))]' : 'text-[hsl(var(--color-text-secondary))]'}`}>{s.title}</span>
                  {i === active && <span className='mt-1.5 font-sans text-[13px] leading-[1.55] text-[rgb(107,104,96)]'>{s.body}</span>}
                </div>
                {/* progress bar */}
                <span className='absolute bottom-[-1px] left-0 right-0 h-[1px] overflow-hidden bg-transparent'>
                  <span key={`${i}-${active}`}
                    className={`${i === active && !paused ? '[animation:land-hiw-progress_7s_linear_forwards]' : ''} block h-full bg-[hsl(var(--color-brand-accent))]`}
                    style={{ width: i < active ? '100%' : i === active && paused ? '60%' : '0%' }} />
                </span>
              </button>
            ))}
          </div>

          {/* preview */}
          <div className='land-reveal overflow-hidden rounded-[6px] border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]'>
            <div className='flex items-center gap-3.5 border-b border-[rgb(37,37,37)] bg-[rgb(30,30,30)] p-[12px_16px]'>
              <div className='flex gap-[6px]'>
                {[0, 1, 2].map((i) => <span key={i} className='h-[9px] w-[9px] rounded-full bg-[rgb(52,52,52)]' />)}
              </div>
              <span className='flex-1 font-mono text-[11px] text-[rgb(107,104,96)]'>
                antesdatela.app / {ADDR[active]}
              </span>
              <span className='font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--color-brand-accent))] border border-[rgba(232,92,47,0.4)] rounded-[2px] px-[8px] py-[4px]'>
                {STEP_LABEL[active]}
              </span>
            </div>
            <div className='min-h-[520px] p-7'>
              {active === 0 && <HiwPublishPreview />}
              {active === 1 && <HiwReadPreview />}
              {active === 2 && <HiwMetricsPreview />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
