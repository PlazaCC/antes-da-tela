'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import { toast } from 'sonner'

export function useLogout() {
  const router = useRouter()
  const { signOut } = useClerk()
  return async () => {
    try {
      await signOut()
      posthog.reset()
      router.replace('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Logout failed')
    }
    router.refresh()
  }
}
