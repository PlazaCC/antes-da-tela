'use client'

import { useState } from 'react'

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
      id="lista-de-espera"
      className="border-t border-[rgb(37,37,37)] bg-[radial-gradient(ellipse_at_80%_50%,rgba(28,114,215,0.07),transparent_60%),rgb(14,14,14)] px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {/* left */}
          <div>
            <h2
              className="land-reveal m-0 mb-7 max-w-[14ch] font-display text-[clamp(36px,5.4vw,72px)] leading-[0.98]"
              data-delay="1"
            >
              Antes da Tela
              <br />
              <span className="text-brand-accent">está chegando.</span>
            </h2>
            <p
              className="land-reveal mb-10 max-w-[480px] text-[clamp(15px,1.2vw,18px)] leading-[1.65] text-text-secondary"
              data-delay="2"
            >
              Seja um dos primeiros a publicar seu roteiro, acompanhar como o
              público reage e levar esses dados para a indústria.
            </p>
            <ul
              className="land-reveal m-0 flex list-none flex-col gap-3 p-0"
              data-delay="3"
            >
              {TRUST.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 text-[14px] leading-[1.5] text-[rgb(107,104,96)]"
                >
                  <span className="mt-[2px] shrink-0 text-[hsl(var(--color-brand-accent))]">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* right */}
          <div className="land-reveal" data-delay="1">
            {submitted ? (
              <div className="flex flex-col items-start gap-4 rounded-[4px] border border-[hsl(var(--color-brand-accent))] bg-[rgb(22,22,22)] p-10 [animation:land-success-pop_0.6s_cubic-bezier(0.2,0.9,0.3,1)]">
                <span className="text-[40px]">🎬</span>
                <h3 className="m-0 font-display text-[28px] text-[hsl(var(--color-text-primary))]">
                  Você está na lista.
                </h3>
                <p className="m-0 text-[14px] leading-[1.6] text-[rgb(107,104,96)]">
                  Avisamos você assim que as portas abrirem. Obrigado por
                  acreditar no projeto.
                </p>
                <span className="inline-flex items-center rounded-[2px] border border-[rgba(28,114,215,0.4)] bg-[rgba(28,114,215,0.12)] px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-brand-accent))]">
                  {role}
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 rounded-[4px] border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] p-8"
              >
                <div className="flex flex-col gap-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]">
                    Eu sou
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`inline-flex cursor-pointer items-center rounded-[2px] border px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-[all_0.2s_ease] ${r === role ? 'border-[rgba(28,114,215,0.4)] bg-[rgba(28,114,215,0.12)] text-[hsl(var(--color-brand-accent))]' : 'border-[rgb(37,37,37)] bg-[rgb(22,22,22)] text-[hsl(var(--color-text-secondary))]'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="email-waitlist"
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]"
                  >
                    Email
                  </label>
                  <input
                    id="email-waitlist"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="rounded-[2px] border border-[rgb(52,52,52)] bg-[rgb(14,14,14)] px-[14px] py-[12px] font-sans text-[14px] text-[hsl(var(--color-text-primary))] outline-none transition-[border-color_0.2s_ease]"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        'hsl(var(--color-brand-accent))'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgb(52,52,52)'
                    }}
                  />
                </div>

                {role === 'Criador' && (
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="project-waitlist"
                      className="font-mono text-[10px] uppercase tracking-[0.16em] text-[rgb(107,104,96)]"
                    >
                      O que você está criando?{' '}
                      <span className="text-[rgb(52,52,52)]">(opcional)</span>
                    </label>
                    <input
                      id="project-waitlist"
                      type="text"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      placeholder="Uma série, um curta, um longa..."
                      className="rounded-[2px] border border-[rgb(52,52,52)] bg-[rgb(14,14,14)] px-[14px] py-[12px] font-sans text-[14px] text-[hsl(var(--color-text-primary))] outline-none transition-[border-color_0.2s_ease]"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          'hsl(var(--color-brand-accent))'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgb(52,52,52)'
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!email || !role || loading}
                  className={`group inline-flex h-[52px] items-center justify-center gap-2.5 self-start rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[rgb(255,255,255)] transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] ${email && role ? 'cursor-pointer opacity-100 hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(28,114,215,0.4)]' : 'cursor-not-allowed opacity-40'}`}
                >
                  {loading ? 'Aguarde...' : 'Garantir meu lugar'}{' '}
                  <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
                    →
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
