import type { ReactNode } from 'react'
import type { LegalTabSlug } from './legal-tabs'
import { PublicacaoEConfidencialidade } from './publicacao-e-confidencialidade'

/**
 * Maps each legal tab slug to the component that renders its body (intro +
 * sections). The page header (title/subtitle) comes from `legal-tabs.ts`;
 * everything below it lives in these content components.
 */
export const LEGAL_CONTENT: Record<LegalTabSlug, () => ReactNode> = {
  'publicacao-e-confidencialidade': PublicacaoEConfidencialidade,
}

/** Lead paragraph rendered right under the page header. */
export function LegalLead({ children }: { children: ReactNode }) {
  return (
    <p className="text-body-large leading-relaxed text-text-secondary">
      {children}
    </p>
  )
}

/** A numbered policy section: semantic <section> with its own heading. */
export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-heading-3 text-text-primary">{title}</h2>
      <div className="flex flex-col gap-4 text-body-default leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  )
}
