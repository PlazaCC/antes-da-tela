'use client'

import posthog from 'posthog-js'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return

    const search = searchParams.toString()
    const url = search ? `${pathname}?${search}` : pathname
    posthog.capture('$pageview', { $current_url: `${window.location.origin}${url}` })
  }, [pathname, searchParams])

  return null
}
