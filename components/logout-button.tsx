'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign-out failed', error.message)
    }
    // Redirect regardless — expired/missing sessions should also land on home.
    router.push('/')
  }

  return (
    <Button
      onClick={logout}
      variant="ghost"
      size="sm"
      className="text-text-muted hover:text-text-secondary text-label-mono-default h-8 px-3 font-normal"
    >
      Sair
    </Button>
  )
}
