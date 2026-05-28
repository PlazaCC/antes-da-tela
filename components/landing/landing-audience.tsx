function ArrowIcon() {
  return (
    <svg className='shrink-0 w-[18px] h-[18px] text-[hsl(var(--color-brand-accent))]'
      viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6'>
      <path d='M4 12h12M12 6l6 6-6 6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function LandingAudience() {
  return (
    <section id='audience' className='border-t border-[rgb(37,37,37)] px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]'>
      <div className='mx-auto max-w-[1280px]'>
        {/* header */}
        <div className='grid gap-12 mb-12 md:mb-16 md:gap-20 md:grid-cols-[clamp(140px,200px,200px)_1fr]'>
          <div className='land-reveal'>
            <span className='inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--color-brand-accent))] before:h-[1px] before:w-[28px] before:shrink-0 before:bg-[hsl(var(--color-brand-accent))] before:content-[""]'>
              <span className='mr-1 text-[rgb(107,104,96)]'>03 /</span>
              Para quem é
            </span>
          </div>
          <h2
            className='font-display land-reveal m-0 text-[clamp(36px,5.4vw,80px)] leading-[0.98]'
            data-delay='1'>
            Feito para quem
            <br />
            <span className='text-brand-accent italic'>vive de histórias.</span>
          </h2>
        </div>

        <div className='grid gap-6 lg:grid-cols-[1.4fr_1fr]'>
          {/* primary card */}
          <article
            className='land-reveal relative flex flex-col gap-6 overflow-hidden rounded-sm border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] p-8 md:p-[56px_48px] md:min-h-[480px]'
            data-delay='1'>
            <div>
              <span className='inline-flex items-center rounded-[2px] border border-[rgba(232,92,47,0.4)] bg-[rgba(232,92,47,0.12)] px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-brand-accent))]'>
                Protagonista
              </span>
            </div>
            <h3 className='font-display relative z-10 m-0 text-[clamp(32px,3.6vw,52px)] leading-[1.02]'>
              Criadores,
              <br />
              <em className='text-brand-accent'>vocês são o ponto de partida.</em>
            </h3>
            <p className='relative z-10 text-text-secondary text-[15px] leading-[1.65] max-w-[520px]'>
              Roteiristas, escritores, criadores de jogos, autores de universos narrativos e pessoas
              com histórias originais para contar. Publique sua obra, construa seu portfólio, receba
              retorno real e chegue à indústria com mais força.
            </p>
            <ul className='relative z-10 flex flex-col gap-2.5 list-none p-0 m-0'>
              {['Publicação organizada por gênero, formato e estilo', 'Registro de autoria automático em cada versão',
                'Métricas de leitura, abandono e reação', 'Conexão direta com produtores e parceiros'].map((item) => (
                <li key={item} className='flex items-center gap-3 text-text-primary text-[14px]'>
                  <ArrowIcon />{item}
                </li>
              ))}
            </ul>
            <a
              href='#waitlist'
              className='group relative z-10 inline-flex h-[52px] items-center justify-center gap-2.5 self-start rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[rgb(14,14,14)] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(232,92,47,0.4)]'>
              Publicar minha história <span className='transition-transform duration-200 group-hover:translate-x-[4px]'>→</span>
            </a>
            {/* deco dot grid */}
            <div className='absolute pointer-events-none pointer-events-none absolute right-[-80px] top-[-80px] h-[360px] w-[360px] bg-[radial-gradient(hsl(var(--color-brand-accent))_1px,transparent_1px)] opacity-[0.12] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] [webkit-mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]'
            />
          </article>

          {/* side cards */}
          <div className='flex flex-col gap-6'>
            {[
              { num: '02', role: 'Leitores e fãs', title: 'Descubra histórias originais antes que virem produção.',
                body: 'Leia, comente, reaja e ajude novas ideias a ganharem corpo. Sua opinião vira sinal real para a indústria.', delay: '2' },
              { num: '03', role: 'Produtores e indústria', title: 'Encontre histórias com público interessado e criadores prontos.',
                body: 'Menos dependência de contatos e achismos. Mais descoberta com base em sinais reais de engajamento.', delay: '3' },
            ].map((c) => (
              <article key={c.num} className='land-reveal rounded-sm land-reveal rounded-sm border border-[rgb(37,37,37)] bg-[rgb(14,14,14)] p-[28px_32px]'
                data-delay={c.delay}>
                <div className='mb-4 flex items-center gap-3.5'>
                  <span className='font-mono text-[11px] tracking-[0.14em] text-[rgb(107,104,96)]'>{c.num}</span>
                  <span className='font-mono text-[11px] uppercase tracking-[0.12em] text-[hsl(var(--color-text-secondary))]'>{c.role}</span>
                </div>
                <h3 className='font-display text-text-primary m-0 mb-3 text-[clamp(20px,1.8vw,24px)] leading-[1.15]'>{c.title}</h3>
                <p className='text-text-secondary text-[14px] leading-[1.6]'>{c.body}</p>
              </article>
            ))}

            <div
              className='land-reveal flex flex-col gap-3 rounded-sm border border-dashed border-[rgb(52,52,52)] bg-transparent p-[24px_32px]'
              data-delay='4'>
              <span className='inline-flex items-center rounded-[2px] border border-[rgba(200,232,122,0.4)] bg-[rgba(200,232,122,0.08)] px-[9px] py-[5px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-brand-lime))]'>
                Em breve
              </span>
              <p className='text-text-secondary m-0 text-[13px] leading-[1.55]'>
                Acesso especial para estudantes, professores e instituições de ensino audiovisual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
