export function AmbassadorsHero() {
  return (
    <section aria-labelledby='embaixadores-titulo' className='mx-auto w-full max-w-[1200px] px-4 pb-12 pt-14 md:px-8 md:pb-24 md:pt-28'>
      <h1
        id='embaixadores-titulo'
        className='[font-family:var(--font-display)] text-[48px] font-medium leading-[0.95] tracking-[-0.04em] text-text-primary animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none md:text-[104px] md:leading-[0.92]'
      >
        Quem lê roteiro <span className='text-brand-blue md:block'>antes de todo mundo.</span>
      </h1>
      <p className='mt-6 max-w-[640px] text-body-default text-text-secondary animate-in fade-in duration-700 [animation-delay:150ms] [animation-fill-mode:both] motion-reduce:animate-none md:mt-8 md:text-[20px] md:leading-[1.5]'>
        Roteiristas, produtores, curadores e pesquisadores que acreditam no Antes da Tela e ajudam a levar novas histórias da
        página até a tela.
      </p>
    </section>
  )
}
