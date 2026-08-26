'use client'

import Link from 'next/link'

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-[clamp(24px,6vw,80px)] pb-[80px] pt-[140px]">
      {/* grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(37,37,37)_1px,transparent_1px),linear-gradient(90deg,rgb(37,37,37)_1px,transparent_1px)] opacity-35 [background-size:90px_90px] [mask-image:radial-gradient(ellipse_at_50%_35%,rgba(0,0,0,.85)_0%,transparent_70%)] [webkit-mask-image:radial-gradient(ellipse_at_50%_35%,rgba(0,0,0,.85)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1280px]">
        <h1 className="m-0 mb-8 font-display text-[clamp(56px,11.5vw,120px)] leading-[0.92] tracking-[-0.025em]">
          <span className="land-reveal block" data-delay="1">
            Toda grande história
          </span>
          <span
            className='land-reveal block text-brand-accent [font-feature-settings:"ss01"]'
            data-delay="2"
          >
            começa antes da tela.
          </span>
        </h1>

        <p
          className="land-reveal mb-10 max-w-[560px] text-[clamp(15px,1.3vw,19px)] leading-[1.55] text-text-secondary"
          data-delay="3"
        >
          A plataforma onde histórias, personagens e universos criativos nascem,
          crescem e se aproximam da indústria do entretenimento.
        </p>

        <div className="land-reveal flex flex-wrap gap-3" data-delay="4">
          <a
            href="#roteiros"
            className="group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[rgb(255,255,255)] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(28,114,215,0.4)]"
          >
            Explorar histórias
            <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
              →
            </span>
          </a>
          <Link
            href="/auth/login"
            className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] border border-[rgb(52,52,52)] bg-transparent px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[hsl(var(--color-text-primary))] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:border-[hsl(var(--color-brand-accent))] hover:text-[hsl(var(--color-brand-accent))]"
          >
            Publicar minha história
          </Link>
        </div>
      </div>
    </section>
  )
}
