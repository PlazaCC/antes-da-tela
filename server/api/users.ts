import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { removeUndefined } from '@/server/utils/object'
import { authenticatedProcedure, createTRPCRouter, publicProcedure, TRPCUser } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export const usersRouter = createTRPCRouter({
  createProfile: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const id = (ctx.user as TRPCUser).id
        const [user] = await db
          .insert(users)
          .values({ id, name: input.name, email: input.email })
          .onConflictDoNothing()
          .returning()
        return user ?? null
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'Failed to create profile',
          cause: err,
        })
      }
    }),

  getProfile: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, input.id),
    })
    return user ?? null
  }),

  updateProfile: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        bio: z.string().max(500).optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Remove undefined fields from input to avoid overwriting columns
      const patch = removeUndefined(input) as Partial<{ name: string; bio: string; image: string }>

      const [updated] = await db
        .update(users)
        .set(patch)
        .where(eq(users.id, (ctx.user as TRPCUser).id))
        .returning()

      return updated
    }),
})
