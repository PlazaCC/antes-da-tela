import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

Sentry.init({
  // Use environment variable so DSN is not hard-coded in the repository.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Sampling rate for traces. Prefer setting via env in production.
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture Replay for 10% of all sessions plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

// Initialize PostHog early on the client
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // Pageviews are handled by the PostHogPageView component
    persistence: 'localStorage+cookie',
  })
}
