'use client'

export default function SentryValidationPage() {
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Sentry validation</h1>
      <p className='mb-4 text-sm text-muted-foreground'>
        Click the button to throw a test error that should be captured by Sentry.
      </p>
      <button
        className='inline-flex items-center rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
        onClick={() => {
          // Official Sentry example: throw an uncaught error in the browser
          throw new Error('Sentry Test Error')
        }}>
        Throw sample error
      </button>
    </div>
  )
}
