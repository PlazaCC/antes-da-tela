'use client'

import type { ReactionEmoji } from '@/lib/constants/reactions'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Encapsulates comment creation and reaction toggling mutations for a given
 * script, including cache invalidation. Extracted from CommentsSidebar.
 */
export function useCommentActions(scriptId: string, currentUserId: string | null) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createCommentMutation = useMutation(trpc.comments.create.mutationOptions())
  const toggleReactionMutation = useMutation(trpc.comments.toggleReaction.mutationOptions())

  function createComment(pageNumber: number, content: string): Promise<void> {
    const trimmed = content.trim()
    if (!trimmed) return Promise.resolve()

    return new Promise((resolve, reject) => {
      createCommentMutation.mutate(
        { scriptId, pageNumber, content: trimmed },
        {
          onSuccess: () => {
            void queryClient.invalidateQueries({
              queryKey: trpc.comments.list.queryOptions({ scriptId, pageNumber }).queryKey,
            })
            resolve()
          },
          onError: (err) => {
            toast.error(err.message)
            reject(err)
          },
        },
      )
    })
  }

  function toggleReaction(commentId: string, emoji: ReactionEmoji, pageNumber: number): void {
    if (!currentUserId) {
      toast.error('Faça login para reagir a comentários.')
      return
    }
    toggleReactionMutation.mutate(
      { commentId, emoji },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: trpc.comments.listReactionsByPage.queryOptions({
              scriptId,
              pageNumber,
              currentUserId: currentUserId ?? undefined,
            }).queryKey,
          })
          void queryClient.invalidateQueries({
            queryKey: trpc.comments.list.queryOptions({ scriptId, pageNumber }).queryKey,
          })
        },
        onError: (err) => {
          toast.error(err.message)
        },
      },
    )
  }

  return {
    createComment,
    toggleReaction,
    isCreating: createCommentMutation.isPending,
    isToggling: toggleReactionMutation.isPending,
  }
}
