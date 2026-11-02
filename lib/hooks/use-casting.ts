'use client'

import type { CastingSubmitInput } from '@/lib/validators/casting'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { toast } from 'sonner'

/** Interpreter side of a call's casting (E7/E8). */
export function useCasting(callId: string) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const query = useQuery(trpc.casting.openCharacters.queryOptions({ callId }))
  const refresh = () => queryClient.invalidateQueries(trpc.casting.openCharacters.queryFilter({ callId }))
  const onError = (error: { message: string }) => toast.error(error.message)

  const submitMutation = useMutation(trpc.casting.submit.mutationOptions({ onError }))
  const withdrawMutation = useMutation(trpc.casting.withdraw.mutationOptions({ onError }))

  return {
    interpreterStatus: query.data?.interpreterStatus ?? null,
    characters: query.data?.characters ?? [],
    isLoading: query.isLoading,
    isSaving: submitMutation.isPending || withdrawMutation.isPending,
    submit: (input: CastingSubmitInput, onDone: () => void) =>
      submitMutation.mutate(input, {
        onSuccess: () => {
          posthog.capture('casting_submitted', { callId, source: input.media.source })
          toast.success('Casting enviado para a curadoria.')
          void refresh()
          onDone()
        },
      }),
    withdraw: (submissionId: string) =>
      withdrawMutation.mutate(
        { submissionId },
        {
          onSuccess: () => {
            toast.success('Casting retirado.')
            void refresh()
          },
        },
      ),
  }
}
