'use client'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { TRPCClientError } from '@trpc/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  authorId: string
  className?: string
}

export function FollowButton({ authorId, className }: FollowButtonProps) {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(trpc.users.isFollowing.queryOptions({ authorId }))
  const following = data?.following ?? false

  const follow = useMutation(trpc.users.follow.mutationOptions())
  const unfollow = useMutation(trpc.users.unfollow.mutationOptions())
  const isPending = follow.isPending || unfollow.isPending

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.users.isFollowing.queryOptions({ authorId }).queryKey })

  const handleError = (err: unknown) => {
    if (err instanceof TRPCClientError && err.data?.code === 'UNAUTHORIZED') {
      router.push('/auth/login')
    }
  }

  const handleClick = () => {
    if (isLoading || isPending) return
    if (following) {
      unfollow.mutate({ authorId }, { onSuccess: invalidate, onError: handleError })
    } else {
      follow.mutate({ authorId }, { onSuccess: invalidate, onError: handleError })
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || isLoading}
      className={cn(
        'inline-flex items-center justify-center px-3 py-1.5 rounded-sm text-[12px] leading-none',
        'border transition-colors disabled:opacity-60',
        following
          ? 'bg-brand-accent border-brand-accent/80 text-text-primary hover:bg-brand-accent/90'
          : 'bg-elevated border-border-subtle text-brand-accent hover:border-brand-accent/50',
        className,
      )}>
      {following ? 'Seguindo' : 'Seguir'}
    </button>
  )
}
