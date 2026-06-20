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

  getProfile: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.usersService.getProfile(input.id)
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
    const { data } = await ctx.supabase.auth.getClaims()
    if (!data?.claims) return { following: false }
    const userId = data.claims.sub as string
    return ctx.usersService.isFollowing(userId, input.authorId)
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
})
