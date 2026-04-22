'use client'

import { useTRPC } from '@/trpc/client'
import { TRPCClientError } from '@trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export function useFollow(authorId: string) {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()

  const queryOpts = trpc.users.isFollowing.queryOptions({ authorId })
  const { data, isLoading } = useQuery(queryOpts)
  const following = data?.following ?? false

  const follow = useMutation(trpc.users.follow.mutationOptions())
  const unfollow = useMutation(trpc.users.unfollow.mutationOptions())
  const isPending = follow.isPending || unfollow.isPending

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryOpts.queryKey })
  const handleError = (err: unknown) => {
    if (err instanceof TRPCClientError && err.data?.code === 'UNAUTHORIZED') {
      router.push('/auth/login')
    }
  }

  const toggle = () => {
    if (isLoading || isPending) return
    if (following) {
      unfollow.mutate({ authorId }, { onSuccess: invalidate, onError: handleError })
    } else {
      follow.mutate({ authorId }, { onSuccess: invalidate, onError: handleError })
    }
  }

  return { following, isLoading, isPending, toggle }
}
