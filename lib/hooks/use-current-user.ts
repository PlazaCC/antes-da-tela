'use client'

import { useTRPC } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'

/**
 * Returns the signed-in user's `users.id` (uuid, not the Clerk id), e-mail and
 * staff flag (UI only — the API enforces admin access itself).
 *
 * Pages inside `(authenticated)/` will always resolve a non-null userId
 * after loading — the layout auth-check guarantees it.
 */
export function useCurrentUser(): { userId: string | null; email: string | null; isAdmin: boolean; isLoading: boolean } {
  const trpc = useTRPC()
  const { isLoaded, isSignedIn } = useAuth()
  const meQuery = useQuery({ ...trpc.users.me.queryOptions(), enabled: !!isSignedIn, staleTime: Infinity })

  return {
    userId: meQuery.data?.id ?? null,
    email: meQuery.data?.email ?? null,
    isAdmin: meQuery.data?.isAdmin ?? false,
    isLoading: !isLoaded || (!!isSignedIn && meQuery.isLoading),
  }
}
