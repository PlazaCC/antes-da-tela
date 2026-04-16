import withErrorHandler from '@/lib/api/withErrorHandler'
import * as Sentry from '@sentry/nextjs'

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message)
    this.name = 'SentryExampleAPIError'
  }
}

async function handler() {
  Sentry.logger.info('Sentry example API called')
  throw new SentryExampleAPIError('This error is raised on the backend called by the example page.')
}

export const GET = withErrorHandler(handler)
