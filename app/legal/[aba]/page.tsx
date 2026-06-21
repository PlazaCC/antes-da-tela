import { LEGAL_CONTENT } from '@/content/legal/legal-content'
import {
  getLegalTab,
  isLegalTabSlug,
  LEGAL_TAB_SLUGS,
} from '@/content/legal/legal-tabs'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ aba: string }> }

// Pre-render every known legal tab at build time.
export function generateStaticParams() {
  return LEGAL_TAB_SLUGS.map((aba) => ({ aba }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { aba } = await params
  const tab = getLegalTab(aba)
  if (!tab) return {}
  return { title: tab.title, description: tab.description }
}

export default async function LegalPage({ params }: Props) {
  const { aba } = await params

  if (!isLegalTabSlug(aba)) {
    notFound()
  }

  const tab = getLegalTab(aba)
  if (!tab) {
    notFound()
  }

  const Content = LEGAL_CONTENT[aba]

  return (
    <main className="min-h-dvh bg-bg-base">
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-5 py-16 md:px-8 md:py-24">
        <header className="flex flex-col gap-3 border-b border-border-subtle pb-8">
          <h1 className="font-display text-heading-2 leading-tight text-text-primary md:text-heading-1">
            {tab.title}
          </h1>
          <p className="font-mono text-label-mono-caps uppercase tracking-wider text-text-muted">
            {tab.subtitle}
          </p>
        </header>

        <Content />
      </article>
    </main>
  )
}
