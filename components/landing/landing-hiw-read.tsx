'use client'

import { useEffect, useRef, useState } from 'react'

const LINES = [
  { type: 'slug', text: 'INT. ESCRITÓRIO . NOITE' },
  { type: 'action', text: 'Marina abre o caderno. As páginas estão em branco.' },
  { type: 'action', text: 'Ela respira fundo. Olha pela janela.' },
  { type: 'char', text: 'MARINA' },
  { type: 'dialog', text: 'Não sei por onde começar.' },
  { type: 'action', text: 'O telefone toca. Ela hesita.' },
  { type: 'char', text: 'MARINA (V.O.)' },
  { type: 'dialog', text: 'Toda história precisa de uma primeira página.' },
]

const REACTIONS = ['💔', '🔥', '👏', '😱', '❤️']

const COMMENTS = [
  { author: 'Carla M.', text: 'O silêncio dela aqui me pegou. Reli três vezes.', lineIdx: 4 },
  { author: 'Diogo S.', text: 'Quero saber quem ligou. Mantém a tensão!', lineIdx: 5 },
  { author: 'Bia R.', text: 'Essa última fala podia abrir a temporada inteira.', lineIdx: 7 },
]

export function HiwReadPreview() {
  const [reactions, setReactions] = useState<{ id: number; lineIdx: number; emoji: string; side: string }[]>([])
  const [comment, setComment] = useState(COMMENTS[0])
  const [progress, setProgress] = useState(0)
  const idRef = useRef(0)

  useEffect(() => {
    let stopped = false
    function loop() {
      if (stopped) return
      const lineIdx = Math.floor(Math.random() * LINES.length)
      const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
      const side = Math.random() > 0.5 ? 'right' : 'left'
      const id = ++idRef.current
      setReactions((prev) => [...prev.slice(-6), { id, lineIdx, emoji, side }])
      setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2200)
      setTimeout(loop, 700 + Math.random() * 900)
    }
    loop()
    return () => { stopped = true }
  }, [])

  useEffect(() => {
    let i = 0
    const t = setInterval(() => { i = (i + 1) % COMMENTS.length; setComment(COMMENTS[i]) }, 3200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let p = 0
    const t = setInterval(() => { p = (p + 0.5) % 100; setProgress(p) }, 70)
    return () => clearInterval(t)
  }, [])

  const lineStyle = (type: string) => ({
    fontFamily: '"Courier New",monospace',
    fontSize: 12,
    lineHeight: 1.6,
    color: type === 'action' ? 'hsl(var(--color-text-secondary))' : 'hsl(var(--color-text-primary))',
    textTransform: type === 'slug' || type === 'char' ? 'uppercase' as const : undefined,
    fontWeight: type === 'slug' ? '700' : undefined,
    paddingLeft: type === 'char' ? '38%' : type === 'dialog' ? '22%' : undefined,
    paddingRight: type === 'dialog' ? '18%' : undefined,
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 20 }}>
      <div style={{ background: 'rgb(14,14,14)', border: '1px solid rgb(37,37,37)', borderRadius: 2, padding: '20px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span className='land-chip land-chip-accent'>DRAMA</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgb(107,104,96)' }}>Cena 14 / 36</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
          {LINES.map((l, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <span style={lineStyle(l.type)}>{l.text}</span>
              {reactions.filter((r) => r.lineIdx === i).map((r) => (
                <span key={r.id} className='land-react-pop' style={{ position: 'absolute', right: -20, top: -4, fontSize: 16, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.4))' }}>{r.emoji}</span>
              ))}
              {comment.lineIdx === i && (
                <div className='land-comment-in' style={{ position: 'absolute', left: 'calc(100% + 12px)', top: -4, width: 180, padding: '8px 10px', background: 'rgb(30,30,30)', border: '1px solid rgb(37,37,37)', borderLeft: '2px solid hsl(var(--color-brand-accent))', borderRadius: 2, zIndex: 10 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--color-brand-accent))', marginBottom: 3 }}>{comment.author}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.4, color: 'hsl(var(--color-text-primary))' }}>{comment.text}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px dashed rgb(37,37,37)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 3, background: 'rgb(37,37,37)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'hsl(var(--color-brand-accent))', width: `${progress}%`, transition: 'width 0.06s linear' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgb(107,104,96)' }}>leitura ao vivo</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: 14, background: 'rgb(14,14,14)', border: '1px solid rgb(37,37,37)', borderRadius: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgb(107,104,96)' }}>Reações</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
            {REACTIONS.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'hsl(var(--color-text-secondary))' }}>
                <span style={{ fontSize: 14 }}>{e}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11 }}>{['comoção','intenso','ótima cena','tensão','favorita'][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 14, background: 'rgb(14,14,14)', border: '1px solid rgb(37,37,37)', borderRadius: 2 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgb(107,104,96)' }}>Pulso ao vivo</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36, marginTop: 10 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className='land-pulse-bar'
                style={{ flex: 1, background: 'hsl(var(--color-brand-accent))', opacity: 0.65, height: 4 + (Math.sin(i * 0.7) + 1) * 12 }} />
            ))}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'rgb(107,104,96)', marginTop: 8, display: 'block' }}>8 leitores agora</span>
        </div>
      </div>
    </div>
  )
}
