'use client'

import type { ReviewStatus } from '@/lib/types/interpreters'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { toast } from 'sonner'

/** Admin queue A1: interpreters by status + approve/reject. */
export function useInterpreterReview(status: ReviewStatus) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const query = useQuery(trpc.admin.listInterpreters.queryOptions({ status }))

  const mutation = useMutation(
    trpc.admin.reviewInterpreter.mutationOptions({
      onSuccess: (result) => {
        posthog.capture('interpreter_reviewed', { decision: result.status })
        toast.success(result.status === 'approved' ? 'Intérprete aprovado.' : 'Cadastro reprovado.')
        void queryClient.invalidateQueries(trpc.admin.listInterpreters.pathFilter())
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  return {
    interpreters: query.data ?? [],
    isLoading: query.isLoading,
    reviewingId: mutation.isPending ? mutation.variables?.userId : null,
    approve: (userId: string) => mutation.mutate({ userId, decision: 'approved' }),
    reject: (userId: string, reason: string) => mutation.mutate({ userId, decision: 'rejected', reason }),
  }
}
