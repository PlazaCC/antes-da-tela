// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN

Sentry.init({
  // Edge runtime uses the same server DSN
  dsn,

  // Sampling rate for edge traces
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),

  enableLogs: process.env.SENTRY_ENABLE_LOGS === 'true',
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true',
  debug: process.env.SENTRY_DEBUG === 'true' || process.env.NODE_ENV !== 'production',
})
