import { authenticatedProcedure, createTRPCRouter, publicProcedure, TRPCUser } from '@/trpc/init'
import type { User } from '@/server/db/schema'
import { TRPCError } from '@trpc/server'
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
      const id = (ctx.user as TRPCUser).id

      const { data: user, error } = await ctx.supabase
        .from('users')
        .insert({ id, name: input.name, email: input.email })
        .select()
        .single()

      // 23505 = unique_violation — profile already exists, treat as success
      if (error?.code === '23505') return null
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return user ?? null
    }),

  getProfile: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data: user } = await ctx.supabase
        .from('users')
        .select('id, name, email, image, bio, created_at')
        .eq('id', input.id)
        .maybeSingle()

      return (user ?? null) as User | null
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
      // Build patch with only the fields that were provided
      const patch: Record<string, string> = {}
      if (input.name !== undefined) patch.name = input.name
      if (input.bio !== undefined) patch.bio = input.bio
      if (input.image !== undefined) patch.image = input.image

      const { data: updated, error } = await ctx.supabase
        .from('users')
        .update(patch)
        .eq('id', (ctx.user as TRPCUser).id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return (updated ?? null) as User | null
    }),
})
