'use client'

import type { CallPhase } from '@/lib/constants/calls'
import type { CallUpsertInput } from '@/lib/validators/calls'
import type { CallResultInput } from '@/lib/validators/votes'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/** Admin mutations on a call (A2/A3); refreshes every admin query afterwards. */
export function useAdminCallMutations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries(trpc.admin.pathFilter())
  const onError = (error: { message: string }) => toast.error(error.message)

  const upsert = useMutation(trpc.admin.upsertCall.mutationOptions({ onError, onSuccess: refresh }))
  const phase = useMutation(trpc.admin.setCallPhase.mutationOptions({ onError, onSuccess: refresh }))
  const review = useMutation(trpc.admin.reviewEntry.mutationOptions({ onError, onSuccess: refresh }))
  const result = useMutation(trpc.admin.setCallResult.mutationOptions({ onError, onSuccess: refresh }))

  return {
    isSaving: upsert.isPending || phase.isPending || review.isPending || result.isPending,
    saveCall: (input: CallUpsertInput, onSaved: (id: string) => void) =>
      upsert.mutate(input, {
        onSuccess: ({ id }) => {
          toast.success('Edital salvo.')
          onSaved(id)
        },
      }),
    setPhase: (callId: string, next: CallPhase) =>
      phase.mutate({ callId, phase: next }, { onSuccess: () => toast.success('Fase atualizada.') }),
    saveResult: (input: CallResultInput) => result.mutate(input, { onSuccess: () => toast.success('Resultado salvo.') }),
    reviewEntry: (entryId: string, decision: 'approved' | 'rejected', reason?: string) =>
      review.mutate({ entryId, decision, reason }, { onSuccess: () => toast.success(decision === 'approved' ? 'Inscrição aprovada.' : 'Inscrição recusada.') }),
  }
}
