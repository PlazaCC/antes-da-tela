'use client'

import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { useFollow } from '@/lib/hooks/use-follow'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  authorId: string
  className?: string
}

export function FollowButton({ authorId, className }: FollowButtonProps) {
  const { userId } = useCurrentUser()
  const { following, isLoading, isPending, toggle } = useFollow(authorId)

  if (userId === authorId) return null

  return (
    <button
      onClick={toggle}
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
