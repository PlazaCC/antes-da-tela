import { AppError, formatErrorForClient } from '@/lib/errors'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import * as Sentry from '@sentry/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { initTRPC, TRPCError } from '@trpc/server'
import { cookies } from 'next/headers'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { RatingsService } from '@/server/services/ratings.service'
import { UsersService } from '@/server/services/users.service'
import { ScriptsService } from '@/server/services/scripts.service'
import { CommentsService } from '@/server/services/comments.service'

export type TRPCUser = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

export const createTRPCContext = async (opts: {
  headers: Headers | Promise<Headers>
}): Promise<{
  headers: Headers
  user: TRPCUser | null
  supabase: SupabaseClient
  ratingsService: RatingsService
  usersService: UsersService
  scriptsService: ScriptsService
  commentsService: CommentsService
}> => {
  const headersObj = await opts.headers
  // CookieStore shape used by Supabase client
  type CookieEntry = { name: string; value: string; options?: Record<string, unknown> }
  type CookieStore = {
    getAll(): CookieEntry[]
    setAll?(cookies: CookieEntry[]): void
  }

  // Prefer Next.js cookie store when available; otherwise derive from headers.
  let cookieStore: CookieStore | null = null
  try {
    // cookies() is Next.js server API; it may throw in non-Next test environments
    cookieStore = await cookies()
  } catch {
    cookieStore = null
  }

  if (!cookieStore) {
    const cookieHeader = headersObj?.get?.('cookie') ?? ''
    cookieStore = {
      getAll() {
        if (!cookieHeader) return []
        return cookieHeader.split('; ').map((pair) => {
          const [name, ...rest] = pair.split('=')
          return { name, value: rest.join('='), options: {} }
        })
      },
      // setAll is a no-op when we only have header cookies
      setAll() {},
    }
  }

  // Create the authenticated Supabase client but do NOT call getUser() here.
  // Public procedures don't need auth and shouldn't pay for a network round-trip.
  // getUser() is called lazily by authenticatedProcedure below.
  const supabase = await createSupabaseClient(cookieStore)

  return {
    headers: headersObj,
    user: null,
    supabase,
    ratingsService: new RatingsService(supabase),
    usersService: new UsersService(supabase),
    scriptsService: new ScriptsService(supabase),
    commentsService: new CommentsService(supabase),
  }
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    try {
      const shouldCapture = error.code === 'INTERNAL_SERVER_ERROR' || !!error.cause
      if (shouldCapture) {
        Sentry.captureException(error)
      }
    } catch (e) {
      console.error('Sentry capture failed in trpc errorFormatter', e)
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        clientError: formatErrorForClient(error.cause ?? error),
      },
    }
  },
})

export const createTRPCRouter = t.router

// Return type is explicit so callers can pass it directly to TRPCError without a cast.
type TRPCCode = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_SERVER_ERROR'

function mapStatusToTRPCCode(status?: number): TRPCCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

const appErrorMiddleware = t.middleware(async ({ next }) => {
  try {
    return await next()
  } catch (err: unknown) {
    if (err instanceof AppError) {
      const code = mapStatusToTRPCCode(err.statusCode)
      Sentry.captureException(err)
      throw new TRPCError({ code, message: err.publicMessage ?? err.message, cause: err as AppError })
    }
    throw err as Error
  }
})

export const publicProcedure = t.procedure.use(appErrorMiddleware)

/**
 * Authenticated procedure — calls getUser() to verify the session with the
 * Supabase Auth server and throws UNAUTHORIZED if no valid session exists.
 *
 * getUser() is intentionally deferred here (not in createTRPCContext) so that
 * public procedures do not pay for the extra network round-trip.
 */
export const authenticatedProcedure = t.procedure.use(appErrorMiddleware).use(async ({ ctx, next }) => {
  const {
    data: { user },
  } = await ctx.supabase.auth.getUser()

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const normalizedUser: TRPCUser = {
    id: user.id,
    email: user.email ?? null,
    user_metadata: (user.user_metadata ?? null) as Record<string, unknown> | null,
  }

  return next({ ctx: { ...ctx, user: normalizedUser } })
})
