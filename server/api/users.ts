import { getAppUser } from '@/lib/auth/app-user'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { documentSchema } from '@/lib/validators/document'
import { updateProfileSchema } from '@/lib/validators/profile'
import { z } from 'zod'

export const usersRouter = createTRPCRouter({
  // The signed-in user's `users.id` (uuid) and staff flag, or null when signed out.
  me: publicProcedure.query(async ({ ctx }) => {
    const me = await getAppUser()
    if (!me) return null
    const { data: isAdmin } = await ctx.supabase.rpc('is_admin')
    return { id: me.id, email: me.email, isAdmin: isAdmin === true }
  }),

  getProfile: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.usersService.getProfile(input.id)
  }),

  // Private: the caller's own identity document, masked. Never part of the public profile.
  getMyDocument: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.usersService.getMyDocument(ctx.user!.id)
  }),

  upsertDocument: authenticatedProcedure.input(documentSchema).mutation(async ({ input, ctx }) => {
    return ctx.usersService.upsertDocument(ctx.user!.id, input)
  }),

  updateProfile: authenticatedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.usersService.updateProfile(ctx.user!.id, input)
    }),

  isFollowing: publicProcedure.input(z.object({ authorId: z.string().uuid() })).query(async ({ input, ctx }) => {
    const me = await getAppUser()
    if (!me) return { following: false }
    return ctx.usersService.isFollowing(me.id, input.authorId)
  }),

  follow: authenticatedProcedure.input(z.object({ authorId: z.string().uuid() })).mutation(async ({ input, ctx }) => {
    return ctx.usersService.follow(ctx.user!.id, input.authorId)
  }),

  unfollow: authenticatedProcedure.input(z.object({ authorId: z.string().uuid() })).mutation(async ({ input, ctx }) => {
    return ctx.usersService.unfollow(ctx.user!.id, input.authorId)
  }),

  getProfileStats: publicProcedure.input(z.object({ userId: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.usersService.getProfileStats(input.userId)
  }),

  listFollowers: publicProcedure.input(z.object({ userId: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.usersService.listFollowers(input.userId)
  }),

  listFollowing: publicProcedure.input(z.object({ userId: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.usersService.listFollowing(input.userId)
  }),

  deactivateAccount: authenticatedProcedure.mutation(async ({ ctx }) => {
    return ctx.usersService.deactivateAccount(ctx.user!.id)
  }),

  deleteAccount: authenticatedProcedure.mutation(async ({ ctx }) => {
    return ctx.usersService.deleteAccount(ctx.user!.id, ctx.user!.clerkId)
  }),
})
