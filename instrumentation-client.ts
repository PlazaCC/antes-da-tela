// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

// Prefer environment variables for all secrets and configuration so values are
// controlled per-environment (local, preview, production).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (!dsn) {
  // Warn in development when DSN is missing so developers notice.
  // In production, absence of DSN simply disables event sending.
  console.warn('Sentry: NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN not set — Sentry will not send events.')
}

Sentry.init({
  dsn,

  // Sampling rate for performance tracing (client). Prefer configuring per-environment.
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),

  // Enable logs if explicitly requested via env
  enableLogs: process.env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS === 'true',

  // Control sending of PII on the client as an opt-in boolean
  sendDefaultPii: process.env.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII === 'true',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
