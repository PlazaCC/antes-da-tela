import { AppError, handleServerError } from '@/lib/errors'
import { NextResponse } from 'next/server'

type RouteHandlerFn = (request: Request) => Promise<unknown>

export function withErrorHandler(handler: RouteHandlerFn) {
  return async function (request: Request) {
    try {
      const result = await handler(request)
      // If the handler returned a NextResponse/Response, pass it through
      if (result instanceof NextResponse || result instanceof Response) return result
      // Otherwise, serialize the result as JSON
      return new NextResponse(JSON.stringify(result ?? null), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    } catch (err) {
      const payload = handleServerError(err)

      const status = err instanceof AppError ? err.statusCode : 500
      return new NextResponse(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json' },
      })
    }
  }
}

export default withErrorHandler
