import { createServerClient } from '@supabase/ssr'
import { initTRPC, TRPCError } from '@trpc/server'
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
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
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
