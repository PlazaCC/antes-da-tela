'use client'

import { notifyError } from '@/lib/feedback'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function useGoogleAuth() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const authenticate = async () => {
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
      setIsLoading(false)
    }
  }

  return { authenticate, isLoading }
}
