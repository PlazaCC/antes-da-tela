import { getOnboardingSteps, safeOnboardingNext } from '@/lib/onboarding/steps'
import { toProfileInput } from '@/lib/validators/profile'
import { intentsSchema, preferencesSchema } from '@/lib/validators/onboarding'
import { describe, expect, it } from 'vitest'

describe('getOnboardingSteps', () => {
  it('reader: intent → profile → preferences → done', () => {
    expect(getOnboardingSteps(['reader'])).toEqual(['intent', 'profile', 'preferences', 'done'])
  })

  it('producer adds the optional publish step after preferences', () => {
    expect(getOnboardingSteps(['producer'])).toEqual(['intent', 'profile', 'preferences', 'publish', 'done'])
  })

  it('interpreter adds the registration after the profile', () => {
    expect(getOnboardingSteps(['interpreter'])).toEqual(['intent', 'profile', 'interpreter', 'preferences', 'done'])
  })

  it('multiple intents get the union of the steps, in order', () => {
    expect(getOnboardingSteps(['producer', 'interpreter', 'reader'])).toEqual([
      'intent',
      'profile',
      'interpreter',
      'preferences',
      'publish',
      'done',
    ])
  })
})

describe('safeOnboardingNext', () => {
  it.each([
    [undefined, '/feed'],
    ['', '/feed'],
    ['https://evil.com', '/feed'],
    ['//evil.com', '/feed'],
    ['/onboarding', '/feed'],
    ['/scripts/123', '/scripts/123'],
  ])('%s → %s', (input, expected) => {
    expect(safeOnboardingNext(input)).toBe(expected)
  })
})

describe('onboarding validators', () => {
  it('requires at least one known intent', () => {
    expect(intentsSchema.safeParse({ intents: [] }).success).toBe(false)
    expect(intentsSchema.safeParse({ intents: ['admin'] }).success).toBe(false)
    expect(intentsSchema.safeParse({ intents: ['reader', 'interpreter'] }).success).toBe(true)
  })

  it('accepts known preference options and drops duplicates', () => {
    const parsed = preferencesSchema.parse({ genres: ['drama', 'drama'], formats: ['curta'], themes: [], goals: [] })
    expect(parsed.genres).toEqual(['drama'])
    expect(preferencesSchema.safeParse({ genres: ['k-pop'], formats: [], themes: [], goals: [] }).success).toBe(false)
  })
})

describe('toProfileInput', () => {
  it('turns blanks into null and keeps only filled links', () => {
    expect(
      toProfileInput({ name: 'Maria', bio: '  ', displayName: 'Mari', pronouns: '', instagram: '@mari', website: ' ' }),
    ).toEqual({
      name: 'Maria',
      bio: null,
      displayName: 'Mari',
      pronouns: null,
      location: null,
      links: { instagram: '@mari' },
    })
  })
})
