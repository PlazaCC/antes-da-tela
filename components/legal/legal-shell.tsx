import Link from 'next/link'
import type { ReactNode } from 'react'

interface LegalShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

/** Shared container for static legal/informational pages. */
export function LegalShell({ title, subtitle, children }: LegalShellProps) {
  return (
    <div className='bg-bg-base min-h-dvh'>
      <div className='max-w-3xl mx-auto w-full px-5 py-12 md:py-16 flex flex-col gap-8'>
        <div className='flex flex-col gap-2'>
          <Link
            href='/'
            className='font-mono text-label-mono-small text-text-muted hover:text-text-primary transition-colors w-fit'>
            ← Início
          </Link>
          <h1 className='font-display text-heading-1 text-text-primary'>{title}</h1>
          {subtitle ? <p className='text-body-default text-text-secondary'>{subtitle}</p> : null}
        </div>
        <div className='flex flex-col gap-5 text-body-default text-text-secondary leading-relaxed'>{children}</div>
      </div>
    </div>
  )
}

interface LegalSectionProps {
  heading: string
  children: ReactNode
}

export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <section className='flex flex-col gap-2'>
      <h2 className='font-display text-heading-3 text-text-primary'>{heading}</h2>
      {children}
    </section>
  )
}

/** Placeholder banner shown while real legal copy is pending. */
export function LegalPlaceholderNote() {
  return (
    <div className='rounded-sm border border-brand-accent/20 bg-brand-accent/5 p-4 text-body-small text-text-secondary'>
      Conteúdo em elaboração. Esta página será atualizada com o texto definitivo em breve.
    </div>
  )
}
