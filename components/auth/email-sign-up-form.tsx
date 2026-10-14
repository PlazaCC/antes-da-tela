'use client'

import { AuthField, AuthFormError } from '@/components/auth/auth-field'
import { EmailCodeForm } from '@/components/auth/email-code-form'
import { Button } from '@/components/ui/button'
import { useEmailSignUp } from '@/lib/hooks/use-email-sign-up'
import { useState, type FormEvent } from 'react'

export function EmailSignUpForm() {
  const { step, error, isBusy, submitDetails, submitCode, resendCode } = useEmailSignUp()
  const [email, setEmail] = useState('')

  if (step === 'code') {
    return (
      <EmailCodeForm
        description={`Enviamos um código para ${email}. Digite-o para confirmar seu e-mail.`}
        submitLabel="Criar conta"
        error={error}
        isBusy={isBusy}
        onSubmit={submitCode}
        onResend={resendCode}
      />
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    submitDetails({
      name: String(data.get('name') ?? ''),
      email: email.trim(),
      password: String(data.get('password') ?? ''),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthField label="Nome" name="name" autoComplete="name" maxLength={100} required />
      <AuthField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <AuthField
        label="Senha (mínimo 8 caracteres)"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {/* Clerk bot protection mounts here when it is enabled for the instance. */}
      <div id="clerk-captcha" />
      <AuthFormError message={error} />
      <Button type="submit" disabled={isBusy} className="h-11 w-full">
        {isBusy ? 'Criando...' : 'Criar conta'}
      </Button>
    </form>
  )
}
