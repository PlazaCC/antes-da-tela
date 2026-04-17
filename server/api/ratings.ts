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
    const { data } = await ctx.supabase.from('ratings').select('score').eq('script_id', input.scriptId)

    const scores = (data ?? []).map((r) => r.score as number)
    const total = scores.length
    const average = total > 0 ? scores.reduce((a, b) => a + b, 0) / total : 0

    return { average, total }
  }),

  getManyAverage: publicProcedure
    .input(z.object({ scriptIds: z.array(z.string().uuid()).optional() }))
    .query(async ({ input, ctx }) => {
      const ids = input.scriptIds ?? []
      if (ids.length === 0) return {}

      const { data } = await ctx.supabase.from('ratings').select('script_id, score').in('script_id', ids)

      const rows = data ?? []
      const map: Record<string, { average: number; total: number }> = {}
      for (const id of ids) {
        map[id] = { average: 0, total: 0 }
      }

      for (const r of rows) {
        const scriptId = (r as any).script_id as string
        const score = (r as any).score as number
        if (!map[scriptId]) {
          map[scriptId] = { average: score, total: 1 }
        } else {
          const prev = map[scriptId]
          map[scriptId] = { average: prev.average + score, total: prev.total + 1 }
        }
      }

      for (const k in map) {
        const entry = map[k]
        if (entry.total > 0) entry.average = entry.average / entry.total
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
