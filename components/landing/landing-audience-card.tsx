interface LandingAudienceCardProps {
  num: string
  role: string
  title: string
  body: string
  delay: string
}

/** Secondary audience card (Editora / Indústria e mercado). */
export function LandingAudienceCard({
  num,
  role,
  title,
  body,
  delay,
}: LandingAudienceCardProps) {
  return (
    <article
      className="land-reveal rounded-[2px] border border-[var(--land-border)] bg-[rgba(255,255,255,0.06)] p-[28px_32px]"
      data-delay={delay}
    >
      <div className="mb-4 flex items-center gap-3.5">
        <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--land-fg-3)]">
          {num}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--land-fg-2)]">
          {role}
        </span>
      </div>
      <h3 className="m-0 mb-3 font-display text-[clamp(20px,1.8vw,24px)] leading-[1.15] text-[var(--land-fg)]">
        {title}
      </h3>
      <p className="text-[14px] leading-[1.6] text-[var(--land-fg-2)]">
        {body}
      </p>
    </article>
  )
}
