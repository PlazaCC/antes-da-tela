import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: 'history_change',
})
