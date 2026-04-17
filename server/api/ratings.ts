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
        .upsert(
          { script_id: input.scriptId, user_id: userId, score: input.score },
          { onConflict: 'script_id,user_id' },
        )

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }
    }),

  getAverage: publicProcedure
    .input(z.object({ scriptId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { data } = await ctx.supabase
        .from('ratings')
        .select('score')
        .eq('script_id', input.scriptId)

      const scores = (data ?? []).map((r) => r.score as number)
      const total = scores.length
      const average = total > 0 ? scores.reduce((a, b) => a + b, 0) / total : 0

      return { average, total }
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
