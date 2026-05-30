'use client'

import Link from 'next/link'

export function LandingHero() {
  return (
    <section
      className='relative flex min-h-screen items-center overflow-hidden px-[clamp(24px,6vw,80px)] pb-[80px] pt-[140px]'>
      {/* grid background */}
      <div
        className='absolute inset-0 pointer-events-none bg-[linear-gradient(rgb(37,37,37)_1px,transparent_1px),linear-gradient(90deg,rgb(37,37,37)_1px,transparent_1px)] opacity-35 [background-size:90px_90px] [mask-image:radial-gradient(ellipse_at_50%_35%,rgba(0,0,0,.85)_0%,transparent_70%)] [webkit-mask-image:radial-gradient(ellipse_at_50%_35%,rgba(0,0,0,.85)_0%,transparent_70%)]'
      />

      <div className='relative z-10 mx-auto w-full max-w-[1280px]'>
        <div className='land-reveal mb-8'>
          <span className='inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[hsl(var(--color-brand-accent))] before:h-[1px] before:w-[28px] before:shrink-0 before:bg-[hsl(var(--color-brand-accent))] before:content-[""]'>
            <span className='mr-1 text-[rgb(107,104,96)]'>00 /</span>
            Plataforma de roteiros
          </span>
        </div>

        <h1
          className='font-display m-0 mb-8 text-[clamp(56px,11.5vw,120px)] leading-[0.92] tracking-[-0.025em]'>
          <span className='block land-reveal' data-delay='1'>
            Toda grande história
          </span>
          <span
            className='block land-reveal text-brand-accent italic [font-feature-settings:"ss01"]'
            data-delay='2'>
            começa antes da tela.
          </span>
        </h1>

        <p
          className='land-reveal text-text-secondary max-w-[560px] text-[clamp(15px,1.3vw,19px)] leading-[1.55] mb-10'
          data-delay='3'>
          A plataforma onde histórias, personagens e universos criativos nascem, crescem e se
          aproximam da indústria do entretenimento.
        </p>

        <div className='land-reveal flex gap-3 flex-wrap' data-delay='4'>
          <a
            href='#roteiros'
            className='group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] bg-[hsl(var(--color-brand-accent))] px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[rgb(14,14,14)] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(232,92,47,0.4)]'>
            Explorar histórias
            <span className='transition-transform duration-200 group-hover:translate-x-[4px]'>→</span>
          </a>
          <Link
            href='/auth/login'
            className='inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] border border-[rgb(52,52,52)] bg-transparent px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[hsl(var(--color-text-primary))] no-underline transition-[transform_0.2s_ease,background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:border-[hsl(var(--color-brand-accent))] hover:text-[hsl(var(--color-brand-accent))]'>
            Publicar minha história
          </Link>
        </div>
      </div>

      {/* scroll indicator */}
      <div
        className='absolute bottom-10 right-[clamp(24px,6vw,80px)] z-10 flex flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgb(107,104,96)]'>
        <span>Role</span>
        <div className='relative h-[64px] w-[1px] overflow-hidden bg-[linear-gradient(to_bottom,rgb(107,104,96),transparent)] after:absolute after:inset-0 after:bg-[linear-gradient(to_bottom,hsl(var(--color-brand-accent)),transparent)] after:content-[""] after:[animation:land-scroll-pulse_2.4s_ease-in-out_infinite]' />
      </div>
    </section>
  )
}
