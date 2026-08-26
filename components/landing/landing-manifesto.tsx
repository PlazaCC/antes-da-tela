'use client'

export function LandingManifesto() {
  return (
    <section
      id="manifesto"
      className="relative z-10 border-[rgb(37,37,37)] px-[clamp(24px,6vw,80px)] py-[clamp(80px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 className="land-reveal text-balanced m-0 mb-14 max-w-[16ch] font-display text-[clamp(36px,5.7vw,80px)] leading-[0.98]">
          De onde vai surgir
          <br />
          <span className="text-brand-accent">a próxima grande história?</span>
        </h2>

        <div className="flex max-w-[620px] flex-col gap-6 text-[clamp(15px,1.2vw,18px)] leading-[1.65] text-text-secondary">
          <p className="land-reveal" data-delay="1">
            Filmes, séries e jogos originais não aparecem do nada. Antes de
            chegarem às telas, eles começam como ideias, roteiros, personagens,
            mundos e universos ainda em construção.
          </p>
          <p className="land-reveal" data-delay="2">
            Mas, entre a criação e a produção, existe um espaço enorme.
            Criadores muitas vezes não conseguem visibilidade. Boas histórias
            ficam escondidas. E a indústria nem sempre sabe onde encontrar
            aquilo que está procurando.
          </p>
          <p
            className="land-reveal mt-4 border-t border-[rgb(37,37,37)] pt-7 font-display text-[clamp(22px,2.2vw,30px)] leading-[1.25] text-text-primary"
            data-delay="3"
          >
            O Antes da Tela nasce para aproximar esses mundos.
          </p>
        </div>
      </div>
    </section>
  )
}
