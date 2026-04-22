import { calculateAverageRating, calculateRatingDistribution } from '@/server/domain/ratings'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
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
      const userId = ctx.user!.id

      const { data: script } = await ctx.supabase
        .from('scripts')
        .select('author_id')
        .eq('id', input.scriptId)
        .maybeSingle()

      if (script?.author_id === userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot rate your own script.',
        })
      }

      const { error } = await ctx.supabase
        .from('ratings')
        .upsert({ script_id: input.scriptId, user_id: userId, score: input.score }, { onConflict: 'script_id,user_id' })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }
    }),

  getAverage: publicProcedure.input(z.object({ scriptId: z.string().uuid() })).query(async ({ input, ctx }) => {
    const { data, error } = await ctx.supabase.from('ratings').select('score').eq('script_id', input.scriptId)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const scores = ((data ?? []) as Array<{ score: number }>).map((row) => Number(row.score))
    const average = calculateAverageRating(scores)

    return { average, total: scores.length }
  }),

  getManyAverage: publicProcedure
    .input(z.object({ scriptIds: z.array(z.string().uuid()).optional() }))
    .query(async ({ input, ctx }) => {
      const ids = input.scriptIds ?? []
      if (ids.length === 0) return {}

      const { data, error } = await ctx.supabase.from('ratings').select('script_id, score').in('script_id', ids)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const rows = (data ?? []) as Array<{ script_id: string; score: number }>
      const accumulator: Record<string, { sum: number; count: number }> = {}

      for (const id of ids) {
        accumulator[id] = { sum: 0, count: 0 }
      }

      for (const row of rows) {
        const scriptId = row.script_id
        const value = Number(row.score)
        const current = accumulator[scriptId] ?? { sum: 0, count: 0 }
        accumulator[scriptId] = {
          sum: current.sum + value,
          count: current.count + 1,
        }
      }

      const map: Record<string, { average: number; total: number }> = {}
      for (const id of ids) {
        const current = accumulator[id]
        const total = current.count
        map[id] = {
          average: total > 0 ? current.sum / total : 0,
          total,
        }
      }

      return map
    }),

  getUserRating: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data } = await ctx.supabase
        .from('ratings')
        .select('score')
        .eq('script_id', input.scriptId)
        .eq('user_id', input.userId)
        .maybeSingle()

      return (data?.score as number | null) ?? null
    }),

  getStats: publicProcedure
    .input(z.object({ scriptId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('ratings')
        .select('score')
        .eq('script_id', input.scriptId)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const scores = ((data ?? []) as Array<{ score: number }>).map((row) => Number(row.score))
      const average = calculateAverageRating(scores)
      const distribution = calculateRatingDistribution(scores)

      return { average, total: scores.length, distribution }
    }),
})
