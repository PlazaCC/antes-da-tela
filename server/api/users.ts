import { eq } from 'drizzle-orm'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const usersRouter = createTRPCRouter({
  createProfile: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(100),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const [user] = await db
        .insert(users)
        .values({ id: input.id, name: input.name, email: input.email })
        .onConflictDoNothing()
        .returning()
      return user
    }),

  getProfile: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, input.id),
      })
      return user ?? null
    }),

  updateProfile: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(100).optional(),
        bio: z.string().max(500).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      const [updated] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning()
      return updated
    }),
})
