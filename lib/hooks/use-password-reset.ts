'use client'

import { clerkErrorMessage } from '@/lib/auth/clerk-error-message'
import { useAuthDestination } from '@/lib/hooks/use-auth-destination'
import { useSignIn } from '@clerk/nextjs'
import { useState } from 'react'

type Step = 'email' | 'code' | 'password'

/**
 * Forgot-password through Clerk: e-mail → reset code → new password, then the
 * user is signed in. Also how a Google-only account gets a password.
 */
export function usePasswordReset() {
  const { signIn, fetchStatus } = useSignIn()
  const { navigate } = useAuthDestination()
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState<string | null>(null)

  async function sendCode() {
    const { error } = await signIn.resetPasswordEmailCode.sendCode()
    if (error) return setError(clerkErrorMessage(error))
    setStep('code')
  }

  async function submitEmail(email: string) {
    setError(null)
    const { error } = await signIn.create({ identifier: email })
    if (error) return setError(clerkErrorMessage(error))
    await sendCode()
  }

  async function submitCode(code: string) {
    setError(null)
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code })
    if (error) return setError(clerkErrorMessage(error))
    setStep('password')
  }

  async function submitPassword(password: string) {
    setError(null)
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true })
    if (error) return setError(clerkErrorMessage(error))
    if (signIn.status !== 'complete') return setError(clerkErrorMessage(null))

    const { error: finalizeError } = await signIn.finalize({ navigate })
    if (finalizeError) setError(clerkErrorMessage(finalizeError))
  }

  async function resendCode() {
    setError(null)
    await sendCode()
  }

  return { step, error, isBusy: fetchStatus === 'fetching', submitEmail, submitCode, submitPassword, resendCode }
}
