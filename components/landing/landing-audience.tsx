import Link from 'next/link'
import { LandingAudienceCard } from './landing-audience-card'
import { LandingSection } from './landing-section'

const BENEFITS = [
  'Publicação organizada por gênero, formato e estilo',
  'Registro de autoria automático em cada versão',
  'Métricas de leitura, abandono e reação',
  'Conexão direta com produtores e parceiros',
]

const CARDS = [
  {
    num: '02',
    role: 'Editora',
    title: 'Descubra histórias originais antes que virem produção.',
    body: 'Leia, comente, reaja e ajude novas ideias a ganharem corpo. Sua opinião vira sinal real para a indústria.',
    delay: '2',
  },
  {
    num: '03',
    role: 'Indústria e mercado',
    title: 'Encontre histórias com público interessado e criadores prontos.',
    body: 'Menos dependência de contatos e achismos. Mais descoberta com base em sinais reais de engajamento.',
    delay: '3',
  },
]

function CheckIcon() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0 text-brand-blue"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M4 12.5l5 5L20 6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LandingAudience() {
  return (
    <LandingSection
      id="audience"
      tone="blue"
      className="px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* header */}
        <div className="mb-12 md:mb-16">
          <h2
            className="land-reveal m-0 font-display text-[clamp(36px,5.4vw,80px)] leading-[0.98] text-[var(--land-fg)]"
            data-delay="1"
          >
            Feito para quem
            <br />
            vive de histórias.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* primary card */}
          <article
            className="land-reveal relative flex flex-col gap-6 overflow-hidden rounded-[2px] bg-brand-cream p-8 text-[#161616] md:min-h-[480px] md:p-[56px_48px]"
            data-delay="1"
          >
            <div>
              <span className="inline-flex items-center rounded-[2px] border border-[rgba(28,114,215,0.4)] bg-[rgba(28,114,215,0.12)] px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[#1c72d7]">
                Protagonista
              </span>
            </div>
            <h3 className="relative z-10 m-0 font-display text-[clamp(32px,3.6vw,52px)] leading-[1.02]">
              Criadores,
              <br />
              <em className="text-[#1c72d7]">vocês são o ponto de partida.</em>
            </h3>
            <p className="relative z-10 max-w-[520px] text-[15px] leading-[1.65] text-[#57534b]">
              Roteiristas, escritores, criadores de jogos, autores de universos
              narrativos e pessoas com histórias originais para contar. Publique
              sua obra, construa seu portfólio, receba retorno real e chegue à
              indústria com mais força.
            </p>
            <ul className="relative z-10 m-0 flex list-none flex-col gap-2.5 p-0">
              {BENEFITS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-[14px] text-[#161616]"
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/login"
              className="group relative z-10 inline-flex h-[52px] items-center justify-center gap-2.5 self-start rounded-[2px] bg-brand-blue px-[28px] text-[14px] font-semibold tracking-[0.01em] text-white no-underline transition-[transform_0.2s_ease,background_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(0,0,0,0.25)]"
            >
              Publicar minha história{' '}
              <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
                →
              </span>
            </Link>
            {/* deco dot grid */}
            <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-[360px] w-[360px] bg-[radial-gradient(hsl(var(--color-brand-blue))_1px,transparent_1px)] opacity-[0.12] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] [webkit-mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          </article>

          {/* side cards */}
          <div className="flex flex-col gap-6">
            {CARDS.map((c) => (
              <LandingAudienceCard key={c.num} {...c} />
            ))}

            <div
              className="land-reveal flex items-center gap-4 rounded-[2px] border border-[var(--land-border)] p-[18px_24px]"
              data-delay="4"
            >
              <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-[2px] border border-[var(--land-border-strong)] px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--land-fg)]">
                É grátis
              </span>
              <p className="m-0 text-[13px] leading-[1.5] text-[var(--land-fg-2)]">
                A publicação é gratuita para criadores, com curadoria e
                ferramentas para o projeto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  )
}
