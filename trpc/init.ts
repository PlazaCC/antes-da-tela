import { AppError, formatErrorForClient } from '@/lib/errors'
import { getAppUser } from '@/lib/auth/app-user'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import * as Sentry from '@sentry/nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { RatingsService } from '@/server/services/ratings.service'
import { UsersService } from '@/server/services/users.service'
import { ScriptsService } from '@/server/services/scripts.service'
import { CommentsService } from '@/server/services/comments.service'
import { CallsAdminService } from '@/server/services/calls-admin.service'
import { CallsService } from '@/server/services/calls.service'
import { CastingService } from '@/server/services/casting.service'
import { InterpretersService } from '@/server/services/interpreters.service'
import { OnboardingService } from '@/server/services/onboarding.service'

export type TRPCUser = {
  /** `users.id` (uuid) — not the Clerk user id. */
  id: string
  clerkId: string
  email: string
  name: string
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
  onboardingService: OnboardingService
  interpretersService: InterpretersService
  callsService: CallsService
  callsAdminService: CallsAdminService
  castingService: CastingService
}> => {
  const headersObj = await opts.headers

  // Supabase client carrying the Clerk session token (anon when signed out).
  // The user is NOT resolved here — public procedures shouldn't pay for it;
  // authenticatedProcedure resolves it lazily below.
  const supabase = await createSupabaseClient()

  return {
    headers: headersObj,
    user: null,
    supabase,
    ratingsService: new RatingsService(supabase),
    usersService: new UsersService(supabase),
    scriptsService: new ScriptsService(supabase),
    commentsService: new CommentsService(supabase),
    onboardingService: new OnboardingService(supabase),
    interpretersService: new InterpretersService(supabase),
    callsService: new CallsService(supabase),
    callsAdminService: new CallsAdminService(supabase),
    castingService: new CastingService(supabase),
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
 * Authenticated procedure — resolves the Clerk session to the `users` row
 * (`getAppUser`, creating/linking it on first sign-in) and throws
 * UNAUTHORIZED when signed out. `ctx.user.id` is the `users.id` uuid.
 */
export const authenticatedProcedure = t.procedure.use(appErrorMiddleware).use(async ({ ctx, next }) => {
  const appUser = await getAppUser()

  if (!appUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const user: TRPCUser = { id: appUser.id, clerkId: appUser.clerkId, email: appUser.email, name: appUser.name }
  return next({ ctx: { ...ctx, user } })
})

/**
 * Staff-only procedure (RFC-006 D6): an authenticated user listed in
 * `admins`, checked through the SECURITY DEFINER `is_admin()` RPC. RLS checks
 * the same function, so this is the friendly error, not the only guard.
 */
export const adminProcedure = authenticatedProcedure.use(async ({ ctx, next }) => {
  const { data: isAdmin, error } = await ctx.supabase.rpc('is_admin')
  if (error || isAdmin !== true) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito à equipe.' })
  }
  return next()
})
