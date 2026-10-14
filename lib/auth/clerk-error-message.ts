import { isClerkAPIResponseError } from '@clerk/nextjs/errors'

const MESSAGES: Record<string, string> = {
  form_identifier_not_found: 'Não encontramos uma conta com esse e-mail. Crie sua conta.',
  form_password_incorrect: 'Senha incorreta. Tente de novo ou use "Esqueci minha senha".',
  form_identifier_exists: 'Já existe uma conta com esse e-mail. Entre ou use "Esqueci minha senha".',
  form_password_pwned: 'Essa senha apareceu em um vazamento de dados. Escolha outra.',
  form_password_compromised: 'Essa senha apareceu em um vazamento de dados. Redefina em "Esqueci minha senha".',
  form_password_validation_failed: 'Senha incorreta. Tente de novo ou use "Esqueci minha senha".',
  form_param_format_invalid: 'Confira o e-mail digitado.',
  form_code_incorrect: 'Código incorreto.',
  verification_expired: 'O código expirou. Peça um novo.',
  verification_failed: 'Não foi possível verificar o código. Peça um novo.',
  strategy_for_user_invalid: 'Essa conta não tem senha. Entre com o Google ou crie uma senha em "Esqueci minha senha".',
  user_locked: 'Conta bloqueada temporariamente por excesso de tentativas. Tente mais tarde.',
  too_many_requests: 'Muitas tentativas. Aguarde um pouco e tente de novo.',
}

const FALLBACK = 'Não foi possível concluir. Tente novamente.'

/** pt-BR message for an error returned by a Clerk custom-flow call. */
export function clerkErrorMessage(error: unknown): string {
  if (!isClerkAPIResponseError(error)) return FALLBACK
  const apiError = error.errors[0]
  if (!apiError) return FALLBACK
  if (MESSAGES[apiError.code]) return MESSAGES[apiError.code]

  const clerkMessage = apiError.longMessage || apiError.message
  if (apiError.code === 'form_password_length_too_short') {
    // The minimum is an instance setting (dev and prod differ) — read it from Clerk's message.
    const minLength = clerkMessage?.match(/\d+/)?.[0]
    return minLength ? `A senha precisa ter pelo menos ${minLength} caracteres.` : 'A senha é curta demais.'
  }
  // Unmapped code: Clerk's own (English) message is more useful than a generic one.
  return clerkMessage || FALLBACK
}
