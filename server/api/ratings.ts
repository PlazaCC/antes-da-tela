import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const ratingsRouter = createTRPCRouter({
  upsert: authenticatedProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        score: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.ratingsService.upsertRating(input.scriptId, ctx.user!.id, input.score)
    }),

  getAverage: publicProcedure.input(z.object({ scriptId: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.ratingsService.getAverage(input.scriptId)
  }),

  getManyAverage: publicProcedure
    .input(z.object({ scriptIds: z.array(z.string().uuid()).optional() }))
    .query(async ({ input, ctx }) => {
      return ctx.ratingsService.getManyAverage(input.scriptIds ?? [])
    }),

  getUserRating: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.ratingsService.getUserRating(input.scriptId, input.userId)
    }),

  getStats: publicProcedure
    .input(z.object({ scriptId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return ctx.ratingsService.getStats(input.scriptId)
    }),
})
