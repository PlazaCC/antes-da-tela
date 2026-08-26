import Link from 'next/link'

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-[rgb(37,37,37)] bg-[rgb(14,14,14)] px-[clamp(24px,6vw,80px)] py-[clamp(100px,12vw,160px)] text-center">
      {/* decorative background text */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center gap-0 overflow-hidden leading-[0.88]"
      >
        {['Antes', 'da Tela'].map((word) => (
          <span
            key={word}
            className="block whitespace-nowrap font-display text-[clamp(120px,18vw,240px)] text-[hsl(var(--color-text-primary))] opacity-[0.04]"
          >
            {word}
          </span>
        ))}
      </div>

      <div className="relative z-[1] mx-auto max-w-[900px]">
        <h2
          className="land-reveal m-0 mb-5 font-display text-[clamp(40px,6.5vw,96px)] leading-[0.96]"
          data-delay="1"
        >
          Sua história merece
          <br />
          <span className="text-brand-accent">ser vista.</span>
        </h2>

        <p
          className="land-reveal mb-12 font-display text-[clamp(24px,3vw,40px)] leading-[1.1] text-text-secondary"
          data-delay="2"
        >
          Comece antes da tela.
        </p>

        <div
          className="land-reveal flex flex-wrap justify-center gap-4"
          data-delay="3"
        >
          <Link
            href="/auth/login"
            className="group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[rgb(255,255,255)] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(28,114,215,0.4)]"
          >
            Acesse agora{' '}
            <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
