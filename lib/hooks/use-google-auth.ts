'use client'

import { notifyError } from '@/lib/feedback'
import { useSignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

const ERROR_MESSAGE = 'Erro ao tentar autenticar com Google. Tente novamente.'

/**
 * Google sign-in through Clerk. Redirects to Google, back to
 * /auth/sso-callback (which finishes the session) and then to `?next=`
 * (default /feed).
 */
export function useGoogleAuth() {
  const searchParams = useSearchParams()
  const { signIn } = useSignIn()
  const [isLoading, setIsLoading] = useState(false)

  const authenticate = async () => {
    setIsLoading(true)
    const next = searchParams.get('next')
    const destination = next && next.startsWith('/') ? next : '/feed'
    const callbackUrl = `/auth/sso-callback?next=${encodeURIComponent(destination)}`

    try {
      const { error } = await signIn.sso({
        strategy: 'oauth_google',
        redirectUrl: destination,
        redirectCallbackUrl: callbackUrl,
      })
      if (error) throw error
      // Page navigates away — no need to reset loading state
    } catch (err) {
      console.error('Google OAuth error', err)
      notifyError(ERROR_MESSAGE)
      setIsLoading(false)
    }
  }

  return { authenticate, isLoading }
}
