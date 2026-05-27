'use client'

const PY = 'clamp(80px,10vw,120px)'
const PX = 'clamp(24px,6vw,80px)'

const PILLARS = [
  {
    verb: 'Criar',
    title: 'Para publicar sua obra',
    body: 'Publique seu roteiro, sua série, seu universo ou sua ideia original. Organize a apresentação, adicione materiais de apoio e registre sua criação em um só lugar.',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' width={28} height={28}><path d='M3 21l3.5-1L20 6.5 17.5 4 4 17.5 3 21z' strokeLinejoin='round'/><path d='M14.5 6.5l3 3'/></svg>,
  },
  {
    verb: 'Descobrir',
    title: 'Para encontrar histórias antes',
    body: 'Encontre histórias originais por gênero, formato e estilo. Descubra novos projetos antes que eles cheguem ao grande público.',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' width={28} height={28}><circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3' strokeLinecap='round'/></svg>,
  },
  {
    verb: 'Participar',
    title: 'Para reagir e comentar',
    body: 'Leia, comente, reaja e avalie. O retorno do público acontece dentro da própria história, no ponto em que ele faz sentido.',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' width={28} height={28}><path d='M4 6h12a4 4 0 014 4v2a4 4 0 01-4 4H10l-5 4v-4a4 4 0 01-1-2.7V10a4 4 0 014-4z'/></svg>,
  },
  {
    verb: 'Decidir',
    title: 'Para transformar dados em argumento',
    body: 'Acompanhe leitura, engajamento, abandono e reação do público. Informações que ajudam a transformar percepção em evidência.',
    icon: <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.4' width={28} height={28}><path d='M4 20V8M10 20V4M16 20v-9M22 20H2' strokeLinecap='round'/></svg>,
  },
]

export function LandingPillars() {
  return (
    <section
      id='plataforma'
      style={{ padding: `${PY} ${PX}`, borderTop: '1px solid rgb(37,37,37)' }}>
      <div className='mx-auto' style={{ maxWidth: 1280 }}>
        {/* header */}
        <div className='grid gap-20 mb-20' style={{ gridTemplateColumns: 'clamp(140px,200px,200px) 1fr' }}>
          <div className='land-reveal'>
            <span className='land-label'>
              <span style={{ color: 'rgb(107,104,96)', marginRight: 4 }}>02 /</span>
              Plataforma
            </span>
          </div>
          <div>
            <h2 className='font-display land-reveal' data-delay='1'
              style={{ fontSize: 'clamp(36px,5.4vw,80px)', lineHeight: 0.98, margin: '0 0 32px', maxWidth: '16ch' }}>
              Um <span className='text-brand-accent italic'>novo tipo</span> de plataforma.
            </h2>
            <div className='flex flex-col gap-2 land-reveal' data-delay='2' style={{ marginBottom: 28 }}>
              {['Não é uma rede social.', 'Não é um depósito de arquivos.', 'Não é só para roteiristas.'].map((t) => (
                <span key={t} className='font-display italic relative pl-5'
                  style={{ fontSize: 'clamp(18px,1.6vw,22px)', color: 'rgb(107,104,96)' }}>
                  <span className='absolute left-0 text-brand-accent not-italic font-bold'>×</span>
                  {t}
                </span>
              ))}
            </div>
            <p className='land-reveal text-text-secondary' data-delay='3'
              style={{ fontSize: 'clamp(15px,1.2vw,18px)', lineHeight: 1.65, maxWidth: 640 }}>
              É um ambiente feito para que histórias ganhem vida antes de chegar à produção. Um lugar
              onde criadores publicam, recebem retorno do público, e acompanham dados que ajudam a
              entender o potencial de cada projeto.
            </p>
          </div>
        </div>

        {/* grid */}
        <div className='grid' style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgb(37,37,37)', border: '1px solid rgb(37,37,37)' }}>
          {PILLARS.map((p, i) => (
            <article key={p.verb} className='land-reveal group flex flex-col gap-3'
              data-delay={i + 1}
              style={{ background: 'rgb(14,14,14)', padding: '36px 28px 40px', transition: 'background .3s ease', cursor: 'default' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgb(22,22,22)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgb(14,14,14)')}>
              <div className='flex items-center justify-between mb-6'>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'rgb(107,104,96)' }}>
                  0{i + 1}
                </span>
                <span className='text-text-secondary' style={{ width: 28, height: 28, transition: 'color .3s ease,transform .3s ease' }}>
                  {p.icon}
                </span>
              </div>
              <span className='font-display italic text-brand-accent' style={{ fontSize: 13, letterSpacing: '0.02em' }}>{p.verb}</span>
              <h3 className='font-display text-text-primary m-0' style={{ fontSize: 'clamp(20px,1.8vw,24px)', lineHeight: 1.15 }}>{p.title}</h3>
              <p className='text-text-secondary' style={{ fontSize: 14, lineHeight: 1.6 }}>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
