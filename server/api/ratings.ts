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
    const { data, error } = await ctx.supabase
      .from('ratings')
      .select('avg:avg(score), total:count(*)', { count: 'exact' })
      .eq('script_id', input.scriptId)
      .maybeSingle()

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const average = data?.avg != null ? Number(data.avg) : 0
    const total = data?.total != null ? Number(data.total) : 0

    return { average, total }
  }),

  getManyAverage: publicProcedure
    .input(z.object({ scriptIds: z.array(z.string().uuid()).optional() }))
    .query(async ({ input, ctx }) => {
      const ids = input.scriptIds ?? []
      if (ids.length === 0) return {}

      const { data, error } = await ctx.supabase
        .from('ratings')
        .select('script_id, avg:avg(score), total:count(*)', { count: 'exact' })
        .in('script_id', ids)
        .group('script_id')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const rows = data ?? []
      const map: Record<string, { average: number; total: number }> = {}
      for (const id of ids) {
        map[id] = { average: 0, total: 0 }
      }

      for (const row of rows) {
        const scriptId = (row as any).script_id as string
        const average = Number((row as any).avg ?? 0)
        const total = Number((row as any).total ?? 0)
        map[scriptId] = { average, total }
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
})
