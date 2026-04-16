'use client'

import { Button } from '@/components/ui/button'
import { notifyError } from '@/lib/feedback'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

function GoogleIcon() {
  return (
    <svg viewBox='0 0 24 24' className='size-4 shrink-0' aria-hidden='true'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  )
}

interface GoogleAuthButtonProps {
  label?: string
  className?: string
}

export function GoogleAuthButton({ label = 'Continuar com Google', className }: GoogleAuthButtonProps) {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const next = searchParams.get('next') ?? '/'
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      if (next !== '/') callbackUrl.searchParams.set('next', next)

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl.toString() },
      })
      // Page navigates away — no need to reset loading state
    } catch (err) {
      console.error('Google OAuth error', err)
      try {
        notifyError('Erro ao tentar autenticar com Google. Tente novamente.')
      } catch {
        try {
          window.alert('Erro ao tentar autenticar com Google. Tente novamente.')
        } catch {}
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGoogleAuth}
      disabled={isLoading}
      variant='outline'
      className={cn('w-full gap-3 border-subtle bg-elevated text-primary hover:bg-surface', className)}>
      <GoogleIcon />
      {isLoading ? 'Redirecionando...' : label}
    </Button>
  )
}
