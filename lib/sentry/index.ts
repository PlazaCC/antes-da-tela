import * as Sentry from '@sentry/nextjs'

export function captureException(err: unknown, context?: Record<string, unknown>) {
  try {
    if (context) Sentry.setContext('context', context)
    const eventId = Sentry.captureException(err as Error)
    return eventId
  } catch (e) {
    // Fallback: log to console if Sentry fails
    console.error('Sentry.captureException failed', e)
    return ''
  }
}

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'

export function captureMessage(message: string, level: SeverityLevel = 'info') {
  try {
    Sentry.captureMessage(message, level)
  } catch (e) {
    console.error('Sentry.captureMessage failed', e)
  }
}

// Do not export Sentry directly — callers must go through the typed wrappers
// above so error handling stays consistent (fallback logs, context enrichment).
// If raw Sentry access is truly needed, import from '@sentry/nextjs' directly.
