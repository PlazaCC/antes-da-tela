import { captureException } from './sentry'

export type ClientErrorPayload = {
  status: 'error'
  code: string
  message: string
  details?: unknown
  issueId?: string
}

export class AppError extends Error {
  public code: string
  public statusCode: number
  public publicMessage: string

  constructor(publicMessage: string, opts?: { code?: string; statusCode?: number; internalMessage?: string }) {
    super(opts?.internalMessage ?? publicMessage)
    this.name = 'AppError'
    this.code = opts?.code ?? 'APP_ERROR'
    this.statusCode = opts?.statusCode ?? 500
    this.publicMessage = publicMessage
  }
}

export function formatErrorForClient(err: unknown): ClientErrorPayload {
  if (err instanceof AppError) {
    return { status: 'error', code: err.code, message: err.publicMessage }
  }

  // Generic fallback message for unknown errors
  return { status: 'error', code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno. Tente novamente mais tarde.' }
}

export function handleServerError(err: unknown): ClientErrorPayload & { issueId?: string } {
  // Send to Sentry and include the event id in the client payload for support.
  const issueId = captureException(err)
  const payload = formatErrorForClient(err)
  return { ...payload, issueId }
}

export default {
  AppError,
  formatErrorForClient,
  handleServerError,
}
