import { usePreferencesForm } from '@/lib/hooks/use-preferences-form'
import { renderHook } from '@testing-library/react'
import posthog from 'posthog-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/trpc/client', () => ({
  useTRPC: () => ({
    onboarding: {
      getPreferences: { queryOptions: () => ({}), queryFilter: () => ({}) },
      upsertPreferences: { mutationOptions: (options: unknown) => options },
    },
  }),
}))

// Captures the options handed to useMutation so the test can run onSuccess.
let mutationOptions: { onSuccess: (saved: unknown) => void }
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined, isLoading: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: (options: typeof mutationOptions) => {
    mutationOptions = options
    return { mutate: vi.fn(), isPending: false }
  },
}))

describe('usePreferencesForm analytics', () => {
  beforeEach(() => vi.mocked(posthog.capture).mockClear())

  it('sends the chosen lists and their counts in preferences_saved', () => {
    renderHook(() => usePreferencesForm({ source: 'onboarding' }))
    mutationOptions.onSuccess({
      genres: ['drama', 'terror'],
      formats: ['série'],
      themes: [],
      goals: ['ler'],
    })
    expect(posthog.capture).toHaveBeenCalledWith('preferences_saved', {
      source: 'onboarding',
      genres: 2,
      formats: 1,
      themes: 0,
      goals: 1,
      selected_genres: ['drama', 'terror'],
      selected_formats: ['série'],
      selected_themes: [],
      selected_goals: ['ler'],
    })
  })
})
