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

  isFollowing: publicProcedure
    .input(z.object({ authorId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data } = await ctx.supabase.auth.getClaims()
      if (!data?.claims) return { following: false }
      const userId = data.claims.sub as string
      const { data: row } = await ctx.supabase
        .from('user_follows')
        .select('follower_id')
        .eq('follower_id', userId)
        .eq('followee_id', input.authorId)
        .maybeSingle()
      return { following: !!row }
    }),

  follow: authenticatedProcedure
    .input(z.object({ authorId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as TRPCUser).id
      if (userId === input.authorId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot follow yourself' })
      }
      const { error } = await ctx.supabase
        .from('user_follows')
        .upsert({ follower_id: userId, followee_id: input.authorId }, { onConflict: 'follower_id,followee_id' })
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { following: true }
    }),

  unfollow: authenticatedProcedure
    .input(z.object({ authorId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as TRPCUser).id
      const { error } = await ctx.supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', userId)
        .eq('followee_id', input.authorId)
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { following: false }
    }),
})
