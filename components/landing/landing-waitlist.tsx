'use client'

import { useState } from 'react'

const PY = 'clamp(80px,10vw,120px)'
const PX = 'clamp(24px,6vw,80px)'

const ROLES = ['Criador', 'Leitor', 'Produtor', 'Outro']

const TRUST = [
  'Desenvolvido no Brasil, para o audiovisual brasileiro.',
  'Seus direitos autorais permanecem seus — sempre.',
  'Construído junto com criadores reais.',
]

export function LandingWaitlist() {
  const [role, setRole] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [project, setProject] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !role) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section
      id='lista-de-espera'
      style={{
        borderTop: '1px solid rgb(37,37,37)',
        padding: `${PY} ${PX}`,
        background: 'radial-gradient(ellipse at 80% 50%,rgba(232,92,47,0.07),transparent 60%),rgb(14,14,14)',
      }}>
      <div className='mx-auto' style={{ maxWidth: 1280 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

          {/* left */}
          <div>
            <div className='land-reveal' style={{ marginBottom: 12 }}>
              <span className='land-label'>
                <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>06 /</span>
                Lista de espera
              </span>
            </div>
            <h2
              className='font-display land-reveal'
              data-delay='1'
              style={{ fontSize: 'clamp(36px,5.4vw,72px)', lineHeight: 0.98, margin: '0 0 28px', maxWidth: '14ch' }}>
              Antes da Tela<br />
              <span className='text-brand-accent italic'>está chegando.</span>
            </h2>
            <p
              className='land-reveal text-text-secondary'
              data-delay='2'
              style={{ fontSize: 'clamp(15px,1.2vw,18px)', lineHeight: 1.65, maxWidth: 480, marginBottom: 40 }}>
              Seja um dos primeiros a publicar seu roteiro, acompanhar como o público reage e levar esses dados para a indústria.
            </p>
            <ul className='land-reveal' data-delay='3' style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TRUST.map((t) => (
                <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: 'rgb(107,104,96)', lineHeight: 1.5 }}>
                  <span style={{ color: 'hsl(var(--color-brand-accent))', marginTop: 2, flexShrink: 0 }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* right */}
          <div className='land-reveal' data-delay='1'>
            {submitted ? (
              <div className='land-success-pop' style={{ padding: 40, background: 'rgb(22,22,22)', border: '1px solid hsl(var(--color-brand-accent))', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 40 }}>🎬</span>
                <h3 className='font-display' style={{ fontSize: 28, margin: 0, color: 'hsl(var(--color-text-primary))' }}>
                  Você está na lista.
                </h3>
                <p style={{ fontSize: 14, color: 'rgb(107,104,96)', lineHeight: 1.6, margin: 0 }}>
                  Avisamos você assim que as portas abrirem. Obrigado por acreditar no projeto.
                </p>
                <span className='land-chip land-chip-accent'>{role}</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ background: 'rgb(22,22,22)', border: '1px solid rgb(37,37,37)', borderRadius: 4, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgb(107,104,96)' }}>
                    Eu sou
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type='button'
                        onClick={() => setRole(r)}
                        className={`land-chip ${r === role ? 'land-chip-accent' : 'land-chip-default'}`}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label
                    htmlFor='email-waitlist'
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgb(107,104,96)' }}>
                    Email
                  </label>
                  <input
                    id='email-waitlist'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='seu@email.com'
                    required
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'hsl(var(--color-text-primary))', background: 'rgb(14,14,14)', border: '1px solid rgb(52,52,52)', borderRadius: 2, padding: '12px 14px', outline: 'none', transition: 'border-color 0.2s ease' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-brand-accent))' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(52,52,52)' }}
                  />
                </div>

                {role === 'Criador' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label
                      htmlFor='project-waitlist'
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgb(107,104,96)' }}>
                      O que você está criando? <span style={{ color: 'rgb(52,52,52)' }}>(opcional)</span>
                    </label>
                    <input
                      id='project-waitlist'
                      type='text'
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      placeholder='Uma série, um curta, um longa...'
                      style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'hsl(var(--color-text-primary))', background: 'rgb(14,14,14)', border: '1px solid rgb(52,52,52)', borderRadius: 2, padding: '12px 14px', outline: 'none', transition: 'border-color 0.2s ease' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-brand-accent))' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgb(52,52,52)' }}
                    />
                  </div>
                )}

                <button
                  type='submit'
                  disabled={!email || !role || loading}
                  className='land-btn land-btn-primary'
                  style={{ opacity: email && role ? 1 : 0.4, cursor: email && role ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
                  {loading ? 'Aguarde...' : 'Garantir meu lugar'} <span className='land-arrow'>→</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
