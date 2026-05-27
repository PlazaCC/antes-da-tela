'use client'

import { useEffect, useState } from 'react'
import { HiwMetricsPreview } from './landing-hiw-metrics'
import { HiwPublishPreview } from './landing-hiw-publish'
import { HiwReadPreview } from './landing-hiw-read'

const PY = 'clamp(80px,10vw,120px)'
const PX = 'clamp(24px,6vw,80px)'

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
      style={{
        padding: `${PY} ${PX}`,
        borderTop: '1px solid rgb(37,37,37)',
        background: 'radial-gradient(ellipse at 20% 0%,rgba(232,92,47,0.06),transparent 50%),rgb(14,14,14)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className='mx-auto' style={{ maxWidth: 1280 }}>
        {/* header */}
        <div className='grid gap-20 mb-16' style={{ gridTemplateColumns: 'clamp(140px,200px,200px) 1fr' }}>
          <div className='land-reveal'>
            <span className='land-label'>
              <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>04 /</span>
              Como funciona
            </span>
          </div>
          <div>
            <h2 className='font-display land-reveal' data-delay='1'
              style={{ fontSize: 'clamp(36px,5.4vw,80px)', lineHeight: 0.98, margin: '0 0 24px', maxWidth: '16ch' }}>
              Da ideia à indústria,
              <br />
              <span className='text-brand-accent italic'>em três passos.</span>
            </h2>
            <p className='land-reveal text-text-secondary' data-delay='2'
              style={{ fontSize: 'clamp(15px,1.2vw,18px)', lineHeight: 1.65, maxWidth: 560 }}>
              Um fluxo curto que conecta criação, público e indústria. Sem fricção, sem depender de
              torcida, com dados reais para sustentar cada conversa.
            </p>
          </div>
        </div>

        {/* layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,340px) 1fr', gap: 40, alignItems: 'start' }}>
          {/* steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 100 }}>
            {STEPS.map((s, i) => (
              <button key={i}
                onClick={() => setActive(i)}
                style={{
                  display: 'grid', gridTemplateColumns: '56px 1fr', gap: 16,
                  textAlign: 'left', padding: '22px 4px',
                  borderTop: '1px solid rgb(37,37,37)',
                  borderBottom: i === 2 ? '1px solid rgb(37,37,37)' : undefined,
                  background: 'transparent', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.25s ease',
                }}>
                <span className='font-display' style={{ fontSize: 42, lineHeight: 1, color: i === active ? 'hsl(var(--color-brand-accent))' : 'rgb(107,104,96)', transition: 'color 0.3s ease' }}>
                  {s.n}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'hsl(var(--color-brand-accent))' }}>{s.verb}</span>
                  <span className='font-display' style={{ fontSize: 'clamp(17px,1.5vw,21px)', lineHeight: 1.2, color: i === active ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-secondary))', transition: 'color 0.3s ease' }}>{s.title}</span>
                  {i === active && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.55, color: 'rgb(107,104,96)', marginTop: 6 }}>{s.body}</span>}
                </div>
                {/* progress bar */}
                <span style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 1, background: 'transparent', overflow: 'hidden' }}>
                  <span key={`${i}-${active}`}
                    className={i === active && !paused ? 'land-hiw-fill' : ''}
                    style={{ display: 'block', height: '100%', background: 'hsl(var(--color-brand-accent))', width: i < active ? '100%' : i === active && paused ? '60%' : '0%' }} />
                </span>
              </button>
            ))}
          </div>

          {/* preview */}
          <div className='land-reveal' style={{ background: 'rgb(22,22,22)', border: '1px solid rgb(37,37,37)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 40px 80px -40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgb(30,30,30)', borderBottom: '1px solid rgb(37,37,37)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgb(52,52,52)' }} />)}
              </div>
              <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgb(107,104,96)' }}>
                antesdatela.app / {ADDR[active]}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'hsl(var(--color-brand-accent))', padding: '4px 8px', border: '1px solid rgba(232,92,47,0.4)', borderRadius: 2 }}>
                {STEP_LABEL[active]}
              </span>
            </div>
            <div style={{ minHeight: 520, padding: 28 }}>
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
