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

  const s = {
    nav: { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
    label: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgb(107,104,96)' },
    input: { fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2, color: 'hsl(var(--color-text-primary))', padding: '12px 14px', background: 'rgb(14,14,14)', border: '1px solid rgb(37,37,37)', borderRadius: 2, minHeight: 50, display: 'flex', alignItems: 'center' as const },
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...s.nav }}>
        {['Detalhes', 'Capa', 'Cenas', 'Registro', 'Publicar'].map((item) => (
          <div key={item} style={{ padding: '10px 12px', color: item === 'Detalhes' ? 'hsl(var(--color-text-primary))' : 'rgb(107,104,96)', borderLeft: item === 'Detalhes' ? '2px solid hsl(var(--color-brand-accent))' : '2px solid transparent' }}>
            {item === 'Detalhes' && <span style={{ color: 'hsl(var(--color-brand-accent))', marginRight: 4 }}>●</span>}
            {item}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={s.label}>Título do roteiro</span>
          <div style={s.input}>{title}<span className='land-caret' /></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={s.label}>Logline</span>
          <div style={{ ...s.input, fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5, minHeight: 72, alignItems: 'flex-start', paddingTop: 14 }}>
            {logline}
            {logline.length > 0 && logline.length < TARGET_LOGLINE.length && <span className='land-caret' />}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ label: 'Formato', chips: ['Curta', 'Longa', 'Série'], active: 'Longa' },
            { label: 'Gênero', chips: ['Drama', 'Thriller', 'Mistério'], active: genre ? 'Drama' : null }
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={s.label}>{f.label}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                {f.chips.map((c) => (
                  <span key={c} className={`land-chip ${c === f.active ? 'land-chip-accent' : 'land-chip-default'}`}>{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8, padding: 16, border: `1px solid ${genre ? 'hsl(var(--color-brand-accent))' : 'rgb(37,37,37)'}`, borderRadius: 2, background: genre ? 'rgba(232,92,47,0.12)' : 'rgb(14,14,14)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.4s ease, background 0.4s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={s.label}>Registro de autoria</span>
            <span style={{ fontSize: 13, color: 'hsl(var(--color-text-primary))' }}>{genre ? 'Pronto para publicar' : 'Preenchendo dados...'}</span>
          </div>
          <button className='land-btn land-btn-primary land-btn-sm' disabled={!genre} style={{ opacity: genre ? 1 : 0.4, cursor: genre ? 'pointer' : 'not-allowed' }}>
            Publicar <span className='land-arrow'>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
