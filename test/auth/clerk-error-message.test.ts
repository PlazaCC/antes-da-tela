import { describe, expect, it, vi } from 'vitest'

class FakeApiError {
  constructor(public errors: { code: string }[]) {}
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

  it('covers unknown password rules with a generic password message', () => {
    expect(clerkErrorMessage(new FakeApiError([{ code: 'form_password_size_in_bytes_exceeded' }]))).toMatch(/Senha inválida/)
  })

  it('falls back for anything else', () => {
    expect(clerkErrorMessage(new Error('boom'))).toBe('Não foi possível concluir. Tente novamente.')
    expect(clerkErrorMessage(null)).toBe('Não foi possível concluir. Tente novamente.')
  })
})
