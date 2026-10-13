'use client'

import { useTRPC } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'

/**
 * Returns the signed-in user's `users.id` (uuid, not the Clerk id) and e-mail.
 *
 * Pages inside `(authenticated)/` will always resolve a non-null userId
 * after loading — the layout auth-check guarantees it.
 */
export function useCurrentUser(): { userId: string | null; email: string | null; isLoading: boolean } {
  const trpc = useTRPC()
  const { isLoaded, isSignedIn } = useAuth()
  const meQuery = useQuery({ ...trpc.users.me.queryOptions(), enabled: !!isSignedIn, staleTime: Infinity })

  return {
    userId: meQuery.data?.id ?? null,
    email: meQuery.data?.email ?? null,
    isLoading: !isLoaded || (!!isSignedIn && meQuery.isLoading),
  }
}
