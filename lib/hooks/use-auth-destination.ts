'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type NavigateArgs = { decorateUrl: (url: string) => string }

/**
 * Where to go after signing in (`?next=`, default /feed) and the `navigate`
 * callback Clerk's `finalize()` expects to get there.
 */
export function useAuthDestination() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/feed'

  function navigate({ decorateUrl }: NavigateArgs) {
    const url = decorateUrl(destination)
    if (url.startsWith('http')) window.location.href = url
    else router.replace(url)
  }

  return { destination, navigate }
}
