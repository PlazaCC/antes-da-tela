const PY = 'clamp(80px,10vw,120px)'
const PX = 'clamp(24px,6vw,80px)'

function ArrowIcon() {
  return (
    <svg className='shrink-0' style={{ width: 18, height: 18, color: 'hsl(var(--color-brand-accent))' }}
      viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6'>
      <path d='M4 12h12M12 6l6 6-6 6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

export function LandingAudience() {
  return (
    <section id='audience' style={{ padding: `${PY} ${PX}`, borderTop: '1px solid rgb(37,37,37)' }}>
      <div className='mx-auto' style={{ maxWidth: 1280 }}>
        {/* header */}
        <div className='grid gap-20 mb-16' style={{ gridTemplateColumns: 'clamp(140px,200px,200px) 1fr' }}>
          <div className='land-reveal'>
            <span className='land-label'>
              <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>03 /</span>
              Para quem é
            </span>
          </div>
          <h2 className='font-display land-reveal' data-delay='1'
            style={{ fontSize: 'clamp(36px,5.4vw,80px)', lineHeight: 0.98, margin: 0 }}>
            Feito para quem
            <br />
            <span className='text-brand-accent italic'>vive de histórias.</span>
          </h2>
        </div>

        <div className='grid gap-6' style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          {/* primary card */}
          <article className='land-reveal relative flex flex-col gap-6 overflow-hidden rounded-sm'
            data-delay='1'
            style={{ background: 'rgb(22,22,22)', border: '1px solid rgb(37,37,37)', padding: '56px 48px', minHeight: 480 }}>
            <div>
              <span className='land-chip land-chip-accent'>Protagonista</span>
            </div>
            <h3 className='font-display relative z-10 m-0' style={{ fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: 1.02 }}>
              Criadores,
              <br />
              <em className='text-brand-accent'>vocês são o ponto de partida.</em>
            </h3>
            <p className='relative z-10 text-text-secondary' style={{ fontSize: 15, lineHeight: 1.65, maxWidth: 520 }}>
              Roteiristas, escritores, criadores de jogos, autores de universos narrativos e pessoas
              com histórias originais para contar. Publique sua obra, construa seu portfólio, receba
              retorno real e chegue à indústria com mais força.
            </p>
            <ul className='relative z-10 flex flex-col gap-2.5 list-none p-0 m-0'>
              {['Publicação organizada por gênero, formato e estilo', 'Registro de autoria automático em cada versão',
                'Métricas de leitura, abandono e reação', 'Conexão direta com produtores e parceiros'].map((item) => (
                <li key={item} className='flex items-center gap-3 text-text-primary' style={{ fontSize: 14 }}>
                  <ArrowIcon />{item}
                </li>
              ))}
            </ul>
            <a href='#waitlist' className='land-btn land-btn-primary self-start relative z-10'>
              Publicar minha história <span className='land-arrow'>→</span>
            </a>
            {/* deco dot grid */}
            <div className='absolute pointer-events-none'
              style={{ right: -80, top: -80, width: 360, height: 360,
                backgroundImage: 'radial-gradient(hsl(var(--color-brand-accent)) 1px,transparent 1px)',
                backgroundSize: '12px 12px', opacity: 0.12,
                maskImage: 'radial-gradient(ellipse at center,black,transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center,black,transparent 70%)' }} />
          </article>

          {/* side cards */}
          <div className='flex flex-col gap-6'>
            {[
              { num: '02', role: 'Leitores e fãs', title: 'Descubra histórias originais antes que virem produção.',
                body: 'Leia, comente, reaja e ajude novas ideias a ganharem corpo. Sua opinião vira sinal real para a indústria.', delay: '2' },
              { num: '03', role: 'Produtores e indústria', title: 'Encontre histórias com público interessado e criadores prontos.',
                body: 'Menos dependência de contatos e achismos. Mais descoberta com base em sinais reais de engajamento.', delay: '3' },
            ].map((c) => (
              <article key={c.num} className='land-reveal rounded-sm'
                data-delay={c.delay}
                style={{ background: 'rgb(14,14,14)', border: '1px solid rgb(37,37,37)', padding: '28px 32px' }}>
                <div className='flex items-center gap-3.5 mb-4'>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgb(107,104,96)', letterSpacing: '0.14em' }}>{c.num}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(var(--color-text-secondary))' }}>{c.role}</span>
                </div>
                <h3 className='font-display text-text-primary m-0 mb-3' style={{ fontSize: 'clamp(20px,1.8vw,24px)', lineHeight: 1.15 }}>{c.title}</h3>
                <p className='text-text-secondary' style={{ fontSize: 14, lineHeight: 1.6 }}>{c.body}</p>
              </article>
            ))}

            <div className='land-reveal flex flex-col gap-3 rounded-sm'
              data-delay='4'
              style={{ padding: '24px 32px', border: '1px dashed rgb(52,52,52)', background: 'transparent' }}>
              <span className='land-chip land-chip-lime'>Em breve</span>
              <p className='text-text-secondary' style={{ fontSize: 13, lineHeight: 1.55, margin: 0 }}>
                Acesso especial para estudantes, professores e instituições de ensino audiovisual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
