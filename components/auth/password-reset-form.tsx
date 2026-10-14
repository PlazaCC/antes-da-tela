'use client'

import { AuthField, AuthFormError } from '@/components/auth/auth-field'
import { EmailCodeForm } from '@/components/auth/email-code-form'
import { Button } from '@/components/ui/button'
import { usePasswordReset } from '@/lib/hooks/use-password-reset'
import { useState, type FormEvent } from 'react'

export function PasswordResetForm() {
  const { step, error, isBusy, submitEmail, submitCode, submitPassword, resendCode } = usePasswordReset()
  const [email, setEmail] = useState('')

  if (step === 'code') {
    return (
      <EmailCodeForm
        description={`Enviamos um código para ${email}. Digite-o para criar uma nova senha.`}
        error={error}
        isBusy={isBusy}
        onSubmit={submitCode}
        onResend={resendCode}
      />
    )
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitPassword(String(new FormData(event.currentTarget).get('password') ?? ''))
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitEmail(email.trim())
  }

  if (step === 'password') {
    return (
      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
        <AuthField
          label="Nova senha (mínimo 8 caracteres)"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          autoFocus
        />
        <AuthFormError message={error} />
        <Button type="submit" disabled={isBusy} className="h-11 w-full">
          {isBusy ? 'Salvando...' : 'Salvar e entrar'}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
      <p className="text-body-small text-text-secondary">
        Informe seu e-mail. Vamos enviar um código para você criar uma nova senha.
      </p>
      <AuthField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoFocus
      />
      <AuthFormError message={error} />
      <Button type="submit" disabled={isBusy} className="h-11 w-full">
        {isBusy ? 'Enviando...' : 'Enviar código'}
      </Button>
    </form>
  )
}
