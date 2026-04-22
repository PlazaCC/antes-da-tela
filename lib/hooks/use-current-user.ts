'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useMemo, useState } from 'react'

/**
 * Returns the currently authenticated user's ID.
 *
 * Centralises the `useEffect + useState` pattern for obtaining `userId`
 * that was previously duplicated in account, profile/edit, and publish pages.
 *
 * Pages inside `(authenticated)/` will always resolve a non-null userId
 * after loading — the layout auth-check guarantees it.
 */
export function useCurrentUser(): { userId: string | null; isLoading: boolean } {
  const supabase = useMemo(() => createClient(), [])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setIsLoading(false)
    })
  }, [supabase])

  return { userId, isLoading }
}
