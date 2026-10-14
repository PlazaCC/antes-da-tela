'use client'

import { clerkErrorMessage } from '@/lib/auth/clerk-error-message'
import { useAuthDestination } from '@/lib/hooks/use-auth-destination'
import { useSignIn } from '@clerk/nextjs'
import { useState } from 'react'

type Step = 'credentials' | 'code'

/**
 * E-mail + password sign-in through Clerk. A new device may ask for an e-mail
 * code (client trust) before the session is created — that is the `code` step.
 */
export function useEmailSignIn() {
  const { signIn, fetchStatus } = useSignIn()
  const { navigate } = useAuthDestination()
  const [step, setStep] = useState<Step>('credentials')
  const [error, setError] = useState<string | null>(null)

  async function finish() {
    const { error } = await signIn.finalize({ navigate })
    if (error) setError(clerkErrorMessage(error))
  }

  async function submitCredentials(email: string, password: string) {
    setError(null)
    const { error } = await signIn.password({ identifier: email, password })
    if (error) return setError(clerkErrorMessage(error))

    if (signIn.status === 'complete') return finish()
    if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
      const { error } = await signIn.mfa.sendEmailCode()
      if (error) return setError(clerkErrorMessage(error))
      return setStep('code')
    }
    setError(clerkErrorMessage(null))
  }

  async function submitCode(code: string) {
    setError(null)
    const { error } = await signIn.mfa.verifyEmailCode({ code })
    if (error) return setError(clerkErrorMessage(error))
    if (signIn.status === 'complete') return finish()
    setError(clerkErrorMessage(null))
  }

  async function resendCode() {
    setError(null)
    const { error } = await signIn.mfa.sendEmailCode()
    if (error) setError(clerkErrorMessage(error))
  }

  return { step, error, isBusy: fetchStatus === 'fetching', submitCredentials, submitCode, resendCode }
}
