'use client'

import { Button } from '@/components/ui/button'
import { useLogout } from '@/lib/hooks/use-logout'
import { cn } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'

/**
 * Dev-only escape hatch: ends the Clerk session even when the app user could
 * not be resolved (navbar shows "Login" and the user menu is unreachable).
 * Rendered by the root layout only when NODE_ENV === 'development'.
 */
export function DevSignOut({ className }: { className?: string }) {
  const { isSignedIn } = useAuth()
  const handleLogout = useLogout()

  if (!isSignedIn) return null

  return (
    <Button
      variant='destructive'
      size='sm'
      onClick={handleLogout}
      className={cn('fixed bottom-4 left-4 z-50 shadow-lg', className)}>
      [dev] Encerrar sessão
    </Button>
  )
}
