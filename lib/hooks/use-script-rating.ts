'use client'

import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

/**
 * Encapsulates the rating upsert mutation for a script, including auth redirect
 * and cache invalidation. Extracted from ScriptPageClient.
 */
export function useScriptRating(scriptId: string, currentUserId: string | null) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const averageOpts = trpc.ratings.getAverage.queryOptions({ scriptId })
  const userRatingOpts = trpc.ratings.getUserRating.queryOptions({
    scriptId,
    userId: currentUserId ?? '',
  })

  const upsertRating = useMutation(trpc.ratings.upsert.mutationOptions())

  function rate(score: number): void {
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }
    upsertRating.mutate(
      { scriptId, score: Math.round(score) },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries(averageOpts)
          void queryClient.invalidateQueries(userRatingOpts)
        },
        onError: (err) => {
          toast.error(err.message)
        },
      },
    )
  }

  return { rate, isPending: upsertRating.isPending }
}
