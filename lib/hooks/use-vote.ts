'use client'

import { useTRPC } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { toast } from 'sonner'

export type VoteState = 'loading' | 'signed-out' | 'needs-email' | 'needs-document' | 'can-vote' | 'voted-here' | 'voted-elsewhere'

/** V1–V3: what the visitor needs before voting for this entry, and the vote itself. */
export function useVote(callId: string, entryId: string) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { isLoaded, isSignedIn } = useAuth()
  const myVote = useQuery({ ...trpc.votes.myVote.queryOptions({ callId }), enabled: !!isSignedIn })
  const document = useQuery({ ...trpc.users.getMyDocument.queryOptions(), enabled: !!isSignedIn })
  const mutation = useMutation(
    trpc.votes.vote.mutationOptions({
      onSuccess: () => {
        posthog.capture('vote_cast', { callId, entryId })
        void queryClient.invalidateQueries(trpc.votes.myVote.queryFilter({ callId }))
      },
      onError: (error) => toast.error(error.message),
    }),
  )

  let state: VoteState
  if (!isLoaded || (isSignedIn && (myVote.isLoading || document.isLoading))) state = 'loading'
  else if (!isSignedIn) state = 'signed-out'
  else if (myVote.data?.entryId === entryId) state = 'voted-here'
  else if (myVote.data?.entryId) state = 'voted-elsewhere'
  else if (!myVote.data?.emailVerified) state = 'needs-email'
  else if (!document.data) state = 'needs-document'
  else state = 'can-vote'

  return { state, isVoting: mutation.isPending, vote: () => mutation.mutate({ callId, entryId }) }
}
