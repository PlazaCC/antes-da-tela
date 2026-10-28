'use client'

import type { Preferences, PreferencesValues } from '@/lib/validators/onboarding'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export type PreferenceKey = keyof Preferences

const EMPTY: Preferences = { genres: [], formats: [], themes: [], goals: [] }

/** Content preferences (onboarding survey and /profile/edit), saved as a whole. */
export function usePreferencesForm(options: { onSaved?: () => void; source: 'onboarding' | 'profile' }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const query = useQuery(trpc.onboarding.getPreferences.queryOptions())
  const [values, setValues] = useState<Preferences>(EMPTY)

  useEffect(() => {
    if (query.data) setValues(query.data)
  }, [query.data])

  const mutation = useMutation(
    trpc.onboarding.upsertPreferences.mutationOptions({
      onSuccess: (saved) => {
        posthog.capture('preferences_saved', {
          source: options.source,
          genres: saved.genres.length,
          formats: saved.formats.length,
          themes: saved.themes.length,
          goals: saved.goals.length,
        })
        void queryClient.invalidateQueries(trpc.onboarding.getPreferences.queryFilter())
        if (options.source === 'profile') toast.success('Preferências salvas.')
        options.onSaved?.()
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  const toggle = (key: PreferenceKey, option: string) =>
    setValues((current) => ({
      ...current,
      [key]: current[key].includes(option) ? current[key].filter((v) => v !== option) : [...current[key], option],
    }))

  return {
    values,
    toggle,
    isLoading: query.isLoading,
    isPending: mutation.isPending,
    save: () => mutation.mutate(values as PreferencesValues),
  }
}
