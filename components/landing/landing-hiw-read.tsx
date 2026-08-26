'use client'

import { useEffect, useRef, useState } from 'react'

const LINES = [
  { type: 'slug', text: 'INT. ESCRITÓRIO . NOITE' },
  {
    type: 'action',
    text: 'Marina abre o caderno. As páginas estão em branco.',
  },
  { type: 'action', text: 'Ela respira fundo. Olha pela janela.' },
  { type: 'char', text: 'MARINA' },
  { type: 'dialog', text: 'Não sei por onde começar.' },
  { type: 'action', text: 'O telefone toca. Ela hesita.' },
  { type: 'char', text: 'MARINA (V.O.)' },
  { type: 'dialog', text: 'Toda história precisa de uma primeira página.' },
]

const REACTIONS = ['💔', '🔥', '👏', '😱', '❤️']

const COMMENTS = [
  {
    author: 'Carla M.',
    text: 'O silêncio dela aqui me pegou. Reli três vezes.',
    lineIdx: 4,
  },
  {
    author: 'Diogo S.',
    text: 'Quero saber quem ligou. Mantém a tensão!',
    lineIdx: 5,
  },
  {
    author: 'Bia R.',
    text: 'Essa última fala podia abrir a temporada inteira.',
    lineIdx: 7,
  },
]

export function HiwReadPreview() {
  const [reactions, setReactions] = useState<
    { id: number; lineIdx: number; emoji: string; side: string }[]
  >([])
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
      setTimeout(
        () => setReactions((prev) => prev.filter((r) => r.id !== id)),
        2200
      )
      setTimeout(loop, 700 + Math.random() * 900)
    }
    loop()
    return () => {
      stopped = true
    }
  }, [])

  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % COMMENTS.length
      setComment(COMMENTS[i])
    }, 3200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let p = 0
    const t = setInterval(() => {
      p = (p + 0.5) % 100
      setProgress(p)
    }, 70)
    return () => clearInterval(t)
  }, [])

  const lineClassName = (type: string) => {
    const base = 'text-[12px] leading-[1.6] font-["Courier_New",monospace]'
    const color =
      type === 'action'
        ? 'text-[hsl(var(--color-text-secondary))]'
        : 'text-[hsl(var(--color-text-primary))]'
    const casing = type === 'slug' || type === 'char' ? 'uppercase' : ''
    const weight = type === 'slug' ? 'font-bold' : ''
    const padding =
      type === 'char'
        ? 'pl-[38%]'
        : type === 'dialog'
          ? 'pl-[22%] pr-[18%]'
          : ''
    return [base, color, casing, weight, padding].filter(Boolean).join(' ')
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
      <div className="relative rounded-[2px] border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] p-[20px_24px]">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="inline-flex items-center rounded-[2px] border border-[rgba(28,114,215,0.4)] bg-[rgba(28,114,215,0.12)] px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-brand-accent))]">
            DRAMA
          </span>
          <span className="font-mono text-[10px] text-[rgb(107,104,96)]">
            Cena 14 / 36
          </span>
        </div>
        <div className="relative flex flex-col gap-2.5">
          {LINES.map((l, i) => (
            <div key={i} className="relative">
              <span className={lineClassName(l.type)}>{l.text}</span>
              {reactions
                .filter((r) => r.lineIdx === i)
                .map((r) => (
                  <span
                    key={r.id}
                    className="absolute right-[-20px] top-[-4px] text-[16px] [animation:land-react-pop_2.2s_ease-out_forwards] [filter:drop-shadow(0_4px_6px_rgba(0,0,0,.4))]"
                  >
                    {r.emoji}
                  </span>
                ))}
              {comment.lineIdx === i && (
                <div className="absolute left-[calc(100%-150px)] top-[-4px] z-10 w-[180px] rounded-[2px] border border-l-2 border-[rgb(37,37,37)] border-l-[hsl(var(--color-brand-accent))] bg-[rgb(30,30,30)] p-[8px_10px] [animation:land-comment-in_0.45s_ease] lg:left-[calc(100%+12px)]">
                  <div className="mb-[3px] font-mono text-[9px] uppercase tracking-[0.12em] text-[hsl(var(--color-brand-accent))]">
                    {comment.author}
                  </div>
                  <div className="text-[11px] leading-[1.4] text-[hsl(var(--color-text-primary))]">
                    {comment.text}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-dashed border-[rgb(37,37,37)] pt-3.5">
          <div className="h-[3px] flex-1 overflow-hidden rounded-[2px] bg-[rgb(37,37,37)]">
            <div
              className="h-full bg-[hsl(var(--color-brand-accent))] transition-[width_0.06s_linear]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[rgb(107,104,96)]">
            leitura ao vivo
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="rounded-[2px] border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] p-[14px]">
          <span className="font-mono text-[10px] text-[rgb(107,104,96)]">
            Reações
          </span>
          <div className="mt-2.5 flex flex-col gap-[7px]">
            {REACTIONS.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[13px] text-[hsl(var(--color-text-secondary))]"
              >
                <span className="text-[14px]">{e}</span>
                <span className="font-sans text-[11px]">
                  {
                    ['comoção', 'intenso', 'ótima cena', 'tensão', 'favorita'][
                      i
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2px] border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] p-[14px]">
          <span className="font-mono text-[10px] text-[rgb(107,104,96)]">
            Pulso ao vivo
          </span>
          <div className="mt-2.5 flex h-[36px] items-end gap-[2px]">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="flex-1 origin-bottom bg-[hsl(var(--color-brand-accent))] opacity-65 [animation:land-pulse-bar_1.2s_ease-in-out_infinite_alternate]"
                style={{
                  animationDuration:
                    (i + 1) % 3 === 0
                      ? '1.4s'
                      : (i + 1) % 2 === 1
                        ? '0.9s'
                        : '1.2s',
                  height: 4 + (Math.sin(i * 0.7) + 1) * 12,
                }}
              />
            ))}
          </div>
          <span className="mt-2 block font-mono text-[9px] tracking-[0.1em] text-[rgb(107,104,96)]">
            8 leitores agora
          </span>
        </div>
      </div>
    </div>
  )
}
