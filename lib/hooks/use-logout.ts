'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useLogout() {
  const router = useRouter()
  return async () => {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
      router.replace('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Logout failed')
    }
    router.refresh()
  }
}
