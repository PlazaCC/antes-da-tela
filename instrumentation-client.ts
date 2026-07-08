import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (!dsn) {
  console.warn('Sentry: NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN not set — Sentry will not send events.')
}

Sentry.init({
  dsn,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  enableLogs: process.env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS === 'true',
  sendDefaultPii: process.env.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII === 'true',
})

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
  api_host: '/ingest',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
