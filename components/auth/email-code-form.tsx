'use client'

import { AuthField, AuthFormError, AuthLinkButton } from '@/components/auth/auth-field'
import { Button } from '@/components/ui/button'
import type { FormEvent } from 'react'

interface EmailCodeFormProps {
  description: string
  submitLabel?: string
  error: string | null
  isBusy: boolean
  onSubmit: (code: string) => void
  onResend: () => void
}

/** Step that asks for the 6-digit code Clerk sent by e-mail. */
export function EmailCodeForm({
  description,
  submitLabel = 'Confirmar',
  error,
  isBusy,
  onSubmit,
  onResend,
}: EmailCodeFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = new FormData(event.currentTarget).get('code')
    onSubmit(String(code ?? '').trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-body-small text-text-secondary">{description}</p>
      <AuthField
        label="Código"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        required
        autoFocus
      />
      <AuthFormError message={error} />
      <Button type="submit" disabled={isBusy} className="h-11 w-full">
        {isBusy ? 'Verificando...' : submitLabel}
      </Button>
      <AuthLinkButton onClick={onResend} disabled={isBusy}>
        Reenviar código
      </AuthLinkButton>
    </form>
  )
}
