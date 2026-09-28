import { cn } from '@/lib/utils'

export type LandingTone = 'dark' | 'cream' | 'blue'

interface LandingSectionProps extends Omit<
  React.ComponentPropsWithoutRef<'section'>,
  'className'
> {
  /** Fixed palette for the section — immune to the app's dark-force theme. */
  tone: LandingTone
  className?: string
}

/**
 * Full-bleed landing section that declares a fixed tone palette.
 *
 * Inside a section, style content with `var(--land-*)` instead of theme
 * tokens so the section does not flip when `.dark` is applied globally:
 * `text-[var(--land-fg)]`, `text-[var(--land-fg-2)]`, `border-[var(--land-border)]`,
 * `bg-[var(--land-card)]`, …
 */
export function LandingSection({
  tone,
  className,
  children,
  ...props
}: LandingSectionProps) {
  return (
    <section
      className={cn('land-tone', `land-tone-${tone}`, className)}
      {...props}
    >
      {children}
    </section>
  )
}
