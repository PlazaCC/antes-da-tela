import type { ClerkProvider } from '@clerk/nextjs'
import type { ComponentProps } from 'react'

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>['appearance']>

const token = (name: string) => `hsl(var(--color-${name}))`

/**
 * Clerk components (<SignIn />, <SignUp />, <UserButton />…) in the app's
 * design tokens, so they follow the same palette and fonts as the rest of the UI.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: token('brand-accent'),
    colorPrimaryForeground: '#ffffff',
    colorDanger: token('state-error'),
    colorSuccess: token('state-success'),
    colorWarning: token('state-warning'),
    colorBackground: token('bg-base'),
    colorForeground: token('text-primary'),
    colorMutedForeground: token('text-secondary'),
    colorMuted: token('bg-elevated'),
    colorInput: token('bg-elevated'),
    colorInputForeground: token('text-primary'),
    // Clerk draws borders at a low alpha of colorBorder — a lighter token keeps them visible.
    colorBorder: token('text-muted'),
    colorNeutral: token('text-primary'),
    fontFamily: 'var(--font-sans)',
    borderRadius: '0.375rem',
  },
  elements: {
    // Flat, like Clerk's hosted page: no card surface or shadow, footer on the page background.
    cardBox: { boxShadow: 'none', border: 'none' },
    card: { boxShadow: 'none', border: 'none' },
    footer: { background: token('bg-base') },
    headerTitle: { fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '1.5rem' },
  },
}
