import { getAppUser } from '@/lib/auth/app-user'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { isValidCpf, stripCpf } from '@/lib/utils/cpf'
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
      return ctx.usersService.createProfile(ctx.user!.id, input.name, input.email)
    }),

  // The signed-in user's `users.id` (uuid), or null when signed out.
  me: publicProcedure.query(async () => {
    const me = await getAppUser()
    return me ? { id: me.id, email: me.email } : null
  }),

  getProfile: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.usersService.getProfile(input.id)
  }),

  // Private: only the caller's own CPF. Never part of the public profile.
  getMyCpf: authenticatedProcedure.query(async ({ ctx }) => {
    return { cpf: await ctx.usersService.getMyCpf() }
  }),

  updateProfile: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        bio: z.string().max(500).nullable().optional(),
        image: z.string().url().optional(),
        // Accept masked or raw input; normalize to 11 digits (or null to clear).
        cpf: z
          .string()
          .nullable()
          .optional()
          .refine((v) => v === null || v === undefined || v === '' || isValidCpf(v), 'CPF inválido'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { cpf, ...rest } = input
      const normalizedCpf = cpf === undefined ? undefined : cpf ? stripCpf(cpf) : null
      return ctx.usersService.updateProfile(ctx.user!.id, { ...rest, cpf: normalizedCpf })
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
