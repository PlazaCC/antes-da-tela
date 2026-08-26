'use client'

const PILLARS = [
  {
    verb: 'Criar',
    title: 'Para publicar sua obra',
    body: 'Publique seu roteiro, sua série, seu universo ou sua ideia original. Organize a apresentação, adicione materiais de apoio e registre sua criação em um só lugar.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <path
          d="M3 21l3.5-1L20 6.5 17.5 4 4 17.5 3 21z"
          strokeLinejoin="round"
        />
        <path d="M14.5 6.5l3 3" />
      </svg>
    ),
  },
  {
    verb: 'Descobrir',
    title: 'Para encontrar histórias antes',
    body: 'Encontre histórias originais por gênero, formato e estilo. Descubra novos projetos antes que eles cheguem ao grande público.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    verb: 'Participar',
    title: 'Para reagir e comentar',
    body: 'Leia, comente, reaja e avalie. O retorno do público acontece dentro da própria história, no ponto em que ele faz sentido.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <path d="M4 6h12a4 4 0 014 4v2a4 4 0 01-4 4H10l-5 4v-4a4 4 0 01-1-2.7V10a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    verb: 'Decidir',
    title: 'Para transformar dados em argumento',
    body: 'Acompanhe leitura, engajamento, abandono e reação do público. Informações que ajudam a transformar percepção em evidência.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        width={28}
        height={28}
      >
        <path d="M4 20V8M10 20V4M16 20v-9M22 20H2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function LandingPillars() {
  return (
    <section
      id="plataforma"
      className="border-t border-[rgb(37,37,37)] px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* header */}
        <div className="mb-16 md:mb-20">
          <h2
            className="land-reveal m-0 mb-8 max-w-[16ch] font-display text-[clamp(36px,5.4vw,80px)] leading-[0.98]"
            data-delay="1"
          >
            Um <span className="text-brand-accent">novo tipo</span> de
            plataforma.
          </h2>
          <div className="land-reveal mb-7 flex flex-col gap-2" data-delay="2">
            {[
              'Não é uma rede social.',
              'Não é um depósito de arquivos.',
              'Não é só para roteiristas.',
            ].map((t) => (
              <span
                key={t}
                className="relative pl-5 font-display text-[clamp(18px,1.6vw,22px)] text-[rgb(107,104,96)]"
              >
                <span className="absolute left-0 font-bold not-italic text-brand-accent">
                  ×
                </span>
                {t}
              </span>
            ))}
          </div>
          <p
            className="land-reveal max-w-[640px] text-[clamp(15px,1.2vw,18px)] leading-[1.65] text-text-secondary"
            data-delay="3"
          >
            É um ambiente feito para que histórias ganhem vida antes de chegar à
            produção. Um lugar onde criadores publicam, recebem retorno do
            público, e acompanham dados que ajudam a entender o potencial de
            cada projeto.
          </p>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 gap-[1px] border border-[rgb(37,37,37)] bg-[rgb(37,37,37)] lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <article
              key={p.verb}
              data-delay={i + 1}
              className="land-reveal group flex cursor-default flex-col gap-3 bg-[rgb(14,14,14)] p-6 transition-[background_0.3s_ease] hover:bg-[rgb(22,22,22)]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-[14px] tracking-[0.02em] text-brand-accent">
                  {p.verb}
                </span>
                <span className="h-[28px] w-[28px] text-text-secondary transition-[color_0.3s_ease,transform_0.3s_ease]">
                  {p.icon}
                </span>
              </div>
              <h3 className="m-0 font-display text-[clamp(20px,1.8vw,24px)] leading-[1.15] text-text-primary">
                {p.title}
              </h3>
              <p className="text-[14px] leading-[1.6] text-text-secondary">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
