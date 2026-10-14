import { describe, expect, it, vi } from 'vitest'

class FakeApiError {
  constructor(public errors: { code: string; message?: string; longMessage?: string }[]) {}
}

vi.mock('@clerk/nextjs/errors', () => ({
  isClerkAPIResponseError: (err: unknown) => err instanceof FakeApiError,
}))

const { clerkErrorMessage } = await import('@/lib/auth/clerk-error-message')

describe('clerkErrorMessage', () => {
  it('maps known Clerk codes to pt-BR', () => {
    expect(clerkErrorMessage(new FakeApiError([{ code: 'form_password_incorrect' }]))).toMatch(/Senha incorreta/)
    expect(clerkErrorMessage(new FakeApiError([{ code: 'form_identifier_exists' }]))).toMatch(/Já existe uma conta/)
  })

  it('reads the instance minimum password length from Clerk', () => {
    const error = new FakeApiError([
      { code: 'form_password_length_too_short', longMessage: 'Passwords must be 15 characters or more.' },
    ])
    expect(clerkErrorMessage(error)).toBe('A senha precisa ter pelo menos 15 caracteres.')
  })

  it("shows Clerk's own message for unmapped codes", () => {
    const error = new FakeApiError([{ code: 'form_password_not_strong_enough', message: 'Password is not strong enough.' }])
    expect(clerkErrorMessage(error)).toBe('Password is not strong enough.')
  })

  it('falls back for anything else', () => {
    expect(clerkErrorMessage(new Error('boom'))).toBe('Não foi possível concluir. Tente novamente.')
    expect(clerkErrorMessage(null)).toBe('Não foi possível concluir. Tente novamente.')
  })
})
