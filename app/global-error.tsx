'use client'

import { notifyError } from '@/lib/feedback'
import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    try {
      const eventId = Sentry.captureException(error)
      notifyError('Ocorreu um erro inesperado. Tente novamente. Se persistir, contate o suporte.', eventId as string)
    } catch (e) {
      console.error('GlobalError capture failed', e)
    }
  }, [error])

  return (
    <html lang='en'>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
