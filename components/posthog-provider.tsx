'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, useState } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN
    if (!token) {
      // Token missing in the environment — don't attempt to init PostHog
      // Keep rendering children so app remains usable in dev without analytics
      // Developer can check console to see why PostHog isn't active
      console.warn('NEXT_PUBLIC_POSTHOG_TOKEN not set — PostHog not initialized.')
      return
    }

    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // Pageviews are handled by the PostHogPageView component
      persistence: 'localStorage+cookie',
    })

    setReady(true)
  }, [])

  if (!ready) return <>{children}</>

  return <PHProvider client={posthog}>{children}</PHProvider>
}
