/**
 * Central registry of the platform's legal tabs.
 *
 * Each entry drives the dynamic route `/legal/[aba]`: the `slug` is the URL
 * segment, and `title`/`subtitle`/`description` feed the page header and
 * metadata. New tabs (Termos de Uso, Privacidade, Cookies, FAQ…) are added
 * here and paired with a content component in `legal-content.tsx`.
 */
export interface LegalTab {
  slug: string
  title: string
  /** Short label for navigation/footer links. */
  navLabel: string
  subtitle: string
  description: string
}

export const LEGAL_TABS = {
  'publicacao-e-confidencialidade': {
    slug: 'publicacao-e-confidencialidade',
    title:
      'Política de Publicação, Propriedade Intelectual e Confidencialidade',
    navLabel: 'Publicação e Confidencialidade',
    subtitle: 'ANTES DA TELA © 2026 — Todos os direitos reservados',
    description:
      'Política que regula o acesso, a visualização, a avaliação e o uso dos materiais publicados na plataforma ANTES DA TELA.',
  },
} satisfies Record<string, LegalTab>

export type LegalTabSlug = keyof typeof LEGAL_TABS

export const LEGAL_TAB_SLUGS = Object.keys(LEGAL_TABS) as LegalTabSlug[]

/** Returns the tab config for a slug, or `null` when the slug is unknown. */
export function getLegalTab(slug: string): LegalTab | null {
  return (LEGAL_TABS as Record<string, LegalTab>)[slug] ?? null
}

/** Type guard narrowing an arbitrary slug to a known legal tab slug. */
export function isLegalTabSlug(slug: string): slug is LegalTabSlug {
  return slug in LEGAL_TABS
}
