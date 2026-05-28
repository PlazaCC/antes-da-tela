'use client'

import { useEffect, useState } from 'react'

const TARGET_TITLE = 'O Silêncio do Abismo'
const TARGET_LOGLINE =
  'Quando o silêncio começa a falar, uma pequena cidade descobre que tem mais a esconder do que admitir.'

export function HiwPublishPreview() {
  const [title, setTitle] = useState('')
  const [logline, setLogline] = useState('')
  const [genre, setGenre] = useState(false)

  useEffect(() => {
    let i = 0
    setTitle('')
    setLogline('')
    setGenre(false)
    const t = setInterval(() => {
      i++
      setTitle(TARGET_TITLE.slice(0, i))
      if (i >= TARGET_TITLE.length) clearInterval(t)
    }, 70)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (title.length < TARGET_TITLE.length) return
    let i = 0
    const t = setInterval(() => {
      i++
      setLogline(TARGET_LOGLINE.slice(0, i))
      if (i >= TARGET_LOGLINE.length) {
        clearInterval(t)
        setTimeout(() => setGenre(true), 250)
      }
    }, 22)
    return () => clearInterval(t)
  }, [title])

  return (
    <div className='grid gap-7 md:grid-cols-[140px_1fr]'>
      <div className='flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.08em]'>
        {['Detalhes', 'Capa', 'Cenas', 'Registro', 'Publicar'].map((item) => (
          <div key={item} className={`px-3 py-[10px] ${item === 'Detalhes' ? 'text-[hsl(var(--color-text-primary))] border-l-2 border-[hsl(var(--color-brand-accent))]' : 'text-[rgb(107,104,96)] border-l-2 border-transparent'}`}>
            {item === 'Detalhes' && <span className='text-[hsl(var(--color-brand-accent))] mr-1'>●</span>}
            {item}
          </div>
        ))}
      </div>

      <div className='flex flex-col gap-5'>
        <div className='flex flex-col gap-2'>
          <span className='font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]'>Título do roteiro</span>
          <div className='flex min-h-[50px] items-center rounded-[2px] border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] px-[14px] py-[12px] font-display text-[20px] leading-[1.2] text-[hsl(var(--color-text-primary))]'>
            {title}<span className='ml-[2px] inline-block h-[1em] w-[1px] align-middle bg-[hsl(var(--color-brand-accent))] [animation:land-caret_1s_steps(2)_infinite]' />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <span className='font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]'>Logline</span>
          <div className='flex min-h-[72px] items-start rounded-[2px] border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] px-[14px] pt-[14px] pb-[12px] font-sans text-[13px] leading-[1.5] text-[hsl(var(--color-text-primary))]'>
            {logline}
            {logline.length > 0 && logline.length < TARGET_LOGLINE.length && (
              <span className='ml-[2px] inline-block h-[1em] w-[1px] align-middle bg-[hsl(var(--color-brand-accent))] [animation:land-caret_1s_steps(2)_infinite]' />
            )}
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {[{ label: 'Formato', chips: ['Curta', 'Longa', 'Série'], active: 'Longa' },
            { label: 'Gênero', chips: ['Drama', 'Thriller', 'Mistério'], active: genre ? 'Drama' : null }
          ].map((f) => (
            <div key={f.label} className='flex flex-col gap-2'>
              <span className='font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]'>{f.label}</span>
              <div className='flex flex-wrap gap-1.5'>
                {f.chips.map((c) => (
                  <span
                    key={c}
                    className={`inline-flex items-center rounded-[2px] border px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${c === f.active ? 'text-[hsl(var(--color-brand-accent))] border-[rgba(232,92,47,0.4)] bg-[rgba(232,92,47,0.12)]' : 'text-[hsl(var(--color-text-secondary))] border-[rgb(37,37,37)] bg-[rgb(22,22,22)]'}`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-2 flex items-center justify-between rounded-[2px] border p-4 transition-[border-color_0.4s_ease,background_0.4s_ease] ${genre ? 'border-[hsl(var(--color-brand-accent))] bg-[rgba(232,92,47,0.12)]' : 'border-[rgb(37,37,37)] bg-[rgb(14,14,14)]'}`}>
          <div className='flex flex-col gap-1'>
            <span className='font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]'>Registro de autoria</span>
            <span className='text-[13px] text-[hsl(var(--color-text-primary))]'>{genre ? 'Pronto para publicar' : 'Preenchendo dados...'}</span>
          </div>
          <button
            className={`group inline-flex h-9 items-center justify-center gap-2.5 rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-4 text-[13px] font-semibold tracking-[0.01em] text-[rgb(14,14,14)] transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] ${genre ? 'opacity-100 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
            disabled={!genre}>
            Publicar <span className='transition-transform duration-200 group-hover:translate-x-[4px]'>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
