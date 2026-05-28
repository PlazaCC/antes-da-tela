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
    <span className='font-display text-[36px] leading-none text-[hsl(var(--color-text-primary))]'>
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

  const CARDS = [
    { label: 'Leituras', to: 1284, delta: '+18% semana', up: true },
    { label: 'Conclusão', to: 72, suffix: '%', delta: '+4 pts', up: true },
    { label: 'Reações', to: 3617, delta: 'média 4.6', up: true },
    { label: 'Abandono', to: 14, suffix: '%', delta: 'cena 22', up: false },
  ]

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {CARDS.map((c) => (
          <div key={c.label} className='flex flex-col gap-1.5 rounded-[2px] border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] p-[14px]'>
            <span className='font-mono text-[10px] uppercase tracking-[0.1em] text-[rgb(107,104,96)]'>{c.label}</span>
            <Counter to={c.to} suffix={c.suffix} start={reveal} />
            <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${c.up ? 'text-[rgb(60,190,126)]' : 'text-[rgb(232,92,47)]'}`}>
              {c.delta}
            </span>
          </div>
        ))}
      </div>

      <div className='rounded-[2px] border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] p-[18px_20px_20px]'>
        <div className='mb-5 flex items-center justify-between'>
          <span className='font-mono text-[10px] uppercase tracking-[0.1em] text-[rgb(107,104,96)]'>Engajamento por cena</span>
          <div className='flex gap-3.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[rgb(107,104,96)]'>
            <span>
              <i className='mr-1.5 inline-block h-[10px] w-[10px] align-middle bg-[hsl(var(--color-brand-accent))]' />
              reações
            </span>
            <span>
              <i className='mr-1.5 inline-block h-[10px] w-[10px] align-middle bg-[rgb(107,104,96)]' />
              leituras
            </span>
          </div>
        </div>

        <div className='mb-3.5 grid h-[160px] grid-cols-[repeat(20,1fr)] items-end gap-[5px]'>
          {BARS.map((v, i) => (
            <div key={i} className='relative flex h-full items-end'>
              <span
                className='absolute bottom-0 left-0 right-0 bg-[rgb(107,104,96)] opacity-25 transition-[height_1.2s_cubic-bezier(0.2,0.7,0.2,1)]'
                style={{ height: reveal ? `${v * 0.62}%` : '0%' }}
              />
              <span
                className='absolute bottom-0 left-0 right-0 bg-[hsl(var(--color-brand-accent))] opacity-95 transition-[height_1.2s_cubic-bezier(0.2,0.7,0.2,1)] [transition-delay:0.2s]'
                style={{ height: reveal ? `${v}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        <div className='flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-[rgb(107,104,96)]'>
          {['cena 01', 'cena 12', 'cena 24', 'cena 36'].map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  )
}
