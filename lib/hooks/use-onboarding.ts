'use client'

import type { UserIntent } from '@/lib/constants/preferences'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { toast } from 'sonner'

/** Onboarding state (intents, completion) for the wizard. */
export function useOnboarding() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const stateQuery = useQuery(trpc.onboarding.getState.queryOptions())
  const invalidate = () => queryClient.invalidateQueries(trpc.onboarding.getState.queryFilter())

  const intentsMutation = useMutation(trpc.onboarding.setIntents.mutationOptions({ onSuccess: invalidate }))
  const completeMutation = useMutation(trpc.onboarding.complete.mutationOptions({ onSuccess: invalidate }))

  const saveIntents = async (intents: UserIntent[]) => {
    try {
      await intentsMutation.mutateAsync({ intents })
      posthog.capture('onboarding_intents_selected', { intents })
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar.')
      return false
    }
  }

  const complete = async () => {
    try {
      await completeMutation.mutateAsync()
      posthog.capture('onboarding_completed', { intents: stateQuery.data?.intents ?? [] })
    } catch (error) {
      // Not blocking: the user can still use the app; the onboarding shows again next visit.
      toast.error(error instanceof Error ? error.message : 'Não foi possível concluir o onboarding.')
    }
  }

  return {
    state: stateQuery.data ?? null,
    isLoading: stateQuery.isLoading,
    isSaving: intentsMutation.isPending || completeMutation.isPending,
    saveIntents,
    complete,
  }
}
