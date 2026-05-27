'use client'

import { useEffect, useState } from 'react'

const BARS = [60, 78, 64, 82, 72, 95, 88, 76, 90, 58, 84, 100, 72, 66, 92, 80, 70, 86, 64, 78]

function Counter({ to, suffix, start }: { to: number; suffix?: string; start: boolean }) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!start) return
    let raf: number
    const t0 = performance.now()
    const dur = 1100
    const animate = (t: number) => {
      const p = Math.min((t - t0) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [start, to])

  return (
    <span className='font-display' style={{ fontSize: 36, lineHeight: 1, color: 'hsl(var(--color-text-primary))' }}>
      {val.toLocaleString('pt-BR')}{suffix ?? ''}
    </span>
  )
}

export function HiwMetricsPreview() {
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 120)
    return () => clearTimeout(t)
  }, [])

  const s = { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgb(107,104,96)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }

  const CARDS = [
    { label: 'Leituras', to: 1284, delta: '+18% semana', up: true },
    { label: 'Conclusão', to: 72, suffix: '%', delta: '+4 pts', up: true },
    { label: 'Reações', to: 3617, delta: 'média 4.6', up: true },
    { label: 'Abandono', to: 14, suffix: '%', delta: 'cena 22', up: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {CARDS.map((c) => (
          <div key={c.label} style={{ background: 'rgb(14,14,14)', border: '1px solid rgb(37,37,37)', borderRadius: 2, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={s}>{c.label}</span>
            <Counter to={c.to} suffix={c.suffix} start={reveal} />
            <span style={{ ...s, color: c.up ? 'rgb(60,190,126)' : 'rgb(232,92,47)' }}>{c.delta}</span>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgb(14,14,14)', border: '1px solid rgb(37,37,37)', borderRadius: 2, padding: '18px 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={s}>Engajamento por cena</span>
          <div style={{ display: 'flex', gap: 14, ...s }}>
            <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'hsl(var(--color-brand-accent))', marginRight: 6, verticalAlign: 'middle' }} />reações</span>
            <span><i style={{ display: 'inline-block', width: 10, height: 10, background: 'rgb(107,104,96)', marginRight: 6, verticalAlign: 'middle' }} />leituras</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20,1fr)', gap: 5, height: 160, alignItems: 'end', marginBottom: 14 }}>
          {BARS.map((v, i) => (
            <div key={i} style={{ height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgb(107,104,96)', opacity: 0.25, height: reveal ? `${v * 0.62}%` : '0%', transition: 'height 1.2s cubic-bezier(0.2,0.7,0.2,1)' }} />
              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'hsl(var(--color-brand-accent))', opacity: 0.95, height: reveal ? `${v}%` : '0%', transition: 'height 1.2s cubic-bezier(0.2,0.7,0.2,1)', transitionDelay: '0.2s' }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', ...s }}>
          {['cena 01', 'cena 12', 'cena 24', 'cena 36'].map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  )
}
