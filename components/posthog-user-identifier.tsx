'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

interface PostHogUserIdentifierProps {
  userId: string
  email: string | undefined
  name: string | undefined
}

export function PostHogUserIdentifier({ userId, email, name }: PostHogUserIdentifierProps) {
  useEffect(() => {
    posthog.identify(userId, {
      ...(name && { name }),
      ...(email && { email }),
    })
  }, [userId, email, name])

  return null
}
