import Link from 'next/link'
import { LandingSection } from './landing-section'

export function LandingFinalCta() {
  return (
    <LandingSection
      tone="blue"
      className="px-[clamp(24px,6vw,80px)] py-[clamp(100px,12vw,160px)] text-center"
    >
      <div className="relative mx-auto max-w-[900px]">
        <h2
          className="land-reveal m-0 mb-10 font-display text-[clamp(40px,6.5vw,96px)] leading-[0.96] text-[var(--land-fg)]"
          data-delay="1"
        >
          Sua história merece
          <br />
          ser vista.
        </h2>

        <div
          className="land-reveal flex flex-wrap justify-center gap-4"
          data-delay="2"
        >
          <Link
            href="/auth/login"
            className="group inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[2px] bg-brand-cream px-[28px] text-[14px] font-semibold tracking-[0.01em] text-[#161616] no-underline transition-[transform_0.2s_ease,box-shadow_0.2s_ease] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-10px_rgba(0,0,0,0.3)]"
          >
            Começar agora{' '}
            <span className="transition-transform duration-200 group-hover:translate-x-[4px]">
              →
            </span>
          </Link>
        </div>
      </div>
    </LandingSection>
  )
}
