// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

Sentry.init({
  // Use server-side DSN; keep secrets out of the repository and in environment variables.
  dsn,

  // Sampling rate for server-side traces. Tune in production.
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),

  // Enable logs if requested via env
  enableLogs: process.env.SENTRY_ENABLE_LOGS === 'true',

  // Send PII only if explicitly enabled via env var
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true',

  // Debug when requested or in non-production for easier troubleshooting
  debug: process.env.SENTRY_DEBUG === 'true' || process.env.NODE_ENV !== 'production',
})
