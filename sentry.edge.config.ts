// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // Use environment variable so DSN is not hard-coded in the repository.
  dsn: process.env.SENTRY_DSN,

  // Sampling rate for traces. Prefer setting via env in production.
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // Keep configurable via env in case project needs to disable it.
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true' || false,
})
