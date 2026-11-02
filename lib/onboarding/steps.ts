import type { UserIntent } from '@/lib/constants/preferences'

export type OnboardingStep = 'intent' | 'profile' | 'interpreter' | 'preferences' | 'publish' | 'done'

/**
 * Wizard steps for the chosen intents (RFC-006 §1). Every intent shares
 * intent → profile → preferences → done; interpreters add their registration
 * after the profile, producers get the optional "publish your first script".
 */
export function getOnboardingSteps(intents: readonly UserIntent[]): OnboardingStep[] {
  return [
    'intent',
    'profile',
    ...(intents.includes('interpreter') ? (['interpreter'] as const) : []),
    'preferences',
    ...(intents.includes('producer') ? (['publish'] as const) : []),
    'done',
  ]
}

/** Only relative, same-origin paths; anything else falls back to the feed. */
export function safeOnboardingNext(next: string | null | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/onboarding') ? next : '/feed'
}
