'use client'

import { AuthField, AuthFormError, AuthLinkButton } from '@/components/auth/auth-field'
import { EmailCodeForm } from '@/components/auth/email-code-form'
import { Button } from '@/components/ui/button'
import { useEmailSignIn } from '@/lib/hooks/use-email-sign-in'
import { useState, type FormEvent } from 'react'

export function EmailSignInForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const { step, error, isBusy, submitCredentials, submitCode, resendCode } = useEmailSignIn()
  const [email, setEmail] = useState('')

  if (step === 'code') {
    return (
      <EmailCodeForm
        description={`Para confirmar que é você, enviamos um código para ${email}.`}
        submitLabel="Entrar"
        error={error}
        isBusy={isBusy}
        onSubmit={submitCode}
        onResend={resendCode}
      />
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const password = String(new FormData(event.currentTarget).get('password') ?? '')
    submitCredentials(email.trim(), password)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <AuthField label="Senha" name="password" type="password" autoComplete="current-password" required />
      <AuthFormError message={error} />
      <Button type="submit" disabled={isBusy} className="h-11 w-full">
        {isBusy ? 'Entrando...' : 'Entrar com e-mail'}
      </Button>
      <AuthLinkButton onClick={onForgotPassword} className="self-start">
        Esqueci minha senha
      </AuthLinkButton>
    </form>
  )
}
