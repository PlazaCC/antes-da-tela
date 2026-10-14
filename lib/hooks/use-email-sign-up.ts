'use client'

import { clerkErrorMessage } from '@/lib/auth/clerk-error-message'
import { useAuthDestination } from '@/lib/hooks/use-auth-destination'
import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'

type Step = 'details' | 'code'

export type SignUpDetails = { name: string; email: string; password: string }

/**
 * E-mail + password sign-up through Clerk, verified by an e-mail code. The
 * verified e-mail is what links a pre-Clerk `users` row (see syncClerkUser).
 */
export function useEmailSignUp() {
  const { signUp, fetchStatus } = useSignUp()
  const { navigate } = useAuthDestination()
  const [step, setStep] = useState<Step>('details')
  const [error, setError] = useState<string | null>(null)

  async function submitDetails({ name, email, password }: SignUpDetails) {
    setError(null)
    const [firstName, ...rest] = name.trim().split(/\s+/)
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName: firstName || undefined,
      lastName: rest.join(' ') || undefined,
    })
    if (error) return setError(clerkErrorMessage(error))

    const { error: sendError } = await signUp.verifications.sendEmailCode()
    if (sendError) return setError(clerkErrorMessage(sendError))
    setStep('code')
  }

  async function submitCode(code: string) {
    setError(null)
    const { error } = await signUp.verifications.verifyEmailCode({ code })
    if (error) return setError(clerkErrorMessage(error))
    if (signUp.status !== 'complete') return setError(clerkErrorMessage(null))

    const { error: finalizeError } = await signUp.finalize({ navigate })
    if (finalizeError) setError(clerkErrorMessage(finalizeError))
  }

  async function resendCode() {
    setError(null)
    const { error } = await signUp.verifications.sendEmailCode()
    if (error) setError(clerkErrorMessage(error))
  }

  return { step, error, isBusy: fetchStatus === 'fetching', submitDetails, submitCode, resendCode }
}
