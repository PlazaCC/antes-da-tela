'use client'

import { AuthLinkButton } from '@/components/auth/auth-field'
import { EmailSignInForm } from '@/components/auth/email-sign-in-form'
import { EmailSignUpForm } from '@/components/auth/email-sign-up-form'
import { PasswordResetForm } from '@/components/auth/password-reset-form'
import { useState } from 'react'

type Mode = 'sign-in' | 'sign-up' | 'reset'

/** E-mail + password auth on the login page: sign in, create account, reset password. */
export function EmailAuth() {
  const [mode, setMode] = useState<Mode>('sign-in')

  return (
    <div className="flex flex-col gap-4">
      {mode === 'sign-in' && <EmailSignInForm onForgotPassword={() => setMode('reset')} />}
      {mode === 'sign-up' && <EmailSignUpForm />}
      {mode === 'reset' && <PasswordResetForm />}

      <div className="flex flex-wrap items-center justify-center gap-x-1 border-t border-border-subtle pt-2">
        {mode === 'sign-in' ? (
          <>
            <span className="text-body-small text-text-muted">Não tem conta?</span>
            <AuthLinkButton onClick={() => setMode('sign-up')} className="text-text-primary">
              Criar conta
            </AuthLinkButton>
          </>
        ) : (
          <AuthLinkButton onClick={() => setMode('sign-in')}>← Voltar para entrar</AuthLinkButton>
        )}
      </div>
    </div>
  )
}
