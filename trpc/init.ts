import { createServerClient } from '@supabase/ssr'
import { initTRPC, TRPCError } from '@trpc/server'
import * as Sentry from '@sentry/nextjs'
import { cookies } from 'next/headers'
import superjson from 'superjson'
import { ZodError } from 'zod'

export type TRPCUser = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown> | null
}

export const createTRPCContext = async (opts: {
  headers: Headers
}): Promise<{ headers: Headers; user?: TRPCUser | null }> => {
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
    const cookieHeader = opts.headers?.get?.('cookie') ?? ''
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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            if (typeof cookieStore.setAll === 'function') {
              cookieStore.setAll(cookiesToSet)
            }
          } catch (err) {
            // log and continue — avoids silently swallowing errors
            console.error('Failed to set cookies in createTRPCContext', err)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Normalize to the `TRPCUser` shape when possible
  const normalizedUser: TRPCUser | null = user
    ? {
        id: user.id,
        email: user.email ?? null,
        user_metadata: (user.user_metadata ?? null) as Record<string, unknown> | null,
      }
    : null

  return { headers: opts.headers, user: normalizedUser }
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    try {
      // Capture internal/unexpected errors in Sentry to avoid noise from expected TRPC errors
      const shouldCapture = error.code === 'INTERNAL_SERVER_ERROR' || !!error.originalError
      if (shouldCapture) {
        Sentry.captureException(error)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Sentry capture failed in trpc errorFormatter', e)
    }

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const authenticatedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})
