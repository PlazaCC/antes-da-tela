'use client'

import { toCharacterInputs, type CallCharacterDraft } from '@/lib/hooks/use-call-characters'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { toast } from 'sonner'

/** The author's side of a call (E3–E5): eligible scripts, own entries, enter/edit/withdraw. */
export function useCallEntries(callId: string, options: { canSubmit: boolean }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const eligible = useQuery({ ...trpc.calls.eligibleScripts.queryOptions({ callId }), enabled: options.canSubmit })
  const mine = useQuery(trpc.calls.myEntries.queryOptions({ callId }))

  const refresh = () => {
    void queryClient.invalidateQueries(trpc.calls.myEntries.queryFilter({ callId }))
    void queryClient.invalidateQueries(trpc.calls.eligibleScripts.queryFilter({ callId }))
  }
  const onError = (error: { message: string }) => toast.error(error.message)

  const enterMutation = useMutation(trpc.calls.enter.mutationOptions({ onError }))
  const updateMutation = useMutation(trpc.calls.updateCharacters.mutationOptions({ onError }))
  const withdrawMutation = useMutation(trpc.calls.withdraw.mutationOptions({ onError }))

  return {
    eligibleScripts: eligible.data ?? [],
    entries: mine.data ?? [],
    isLoading: mine.isLoading || (options.canSubmit && eligible.isLoading),
    isSaving: enterMutation.isPending || updateMutation.isPending || withdrawMutation.isPending,
    enter: (scriptId: string, drafts: CallCharacterDraft[], onDone: () => void) =>
      enterMutation.mutate(
        { callId, scriptId, characters: toCharacterInputs(drafts) },
        {
          onSuccess: () => {
            posthog.capture('call_entry_submitted', { callId, characters: drafts.length })
            toast.success('Inscrição enviada! Ela passa pela curadoria antes de aparecer no edital.')
            refresh()
            onDone()
          },
        },
      ),
    updateCharacters: (entryId: string, drafts: CallCharacterDraft[], onDone: () => void) =>
      updateMutation.mutate(
        { entryId, characters: toCharacterInputs(drafts) },
        {
          onSuccess: () => {
            toast.success('Personagens atualizados.')
            refresh()
            onDone()
          },
        },
      ),
    withdraw: (entryId: string) =>
      withdrawMutation.mutate(
        { entryId },
        {
          onSuccess: () => {
            toast.success('Inscrição retirada.')
            refresh()
          },
        },
      ),
  }
}
