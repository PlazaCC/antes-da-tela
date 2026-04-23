'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { ErrorFallback } from '@/components/error-fallback'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
    console.error(error)
  }, [error])

  return (
    <main className='min-h-[80vh] flex items-center justify-center'>
      <ErrorFallback reset={reset} />
    </main>
  )
}
