import { notifyInterpreterReview } from '@/lib/email/interpreter-review'
import { interpreterReviewSchema } from '@/lib/validators/interpreter'
import { adminProcedure, createTRPCRouter } from '@/trpc/init'
import { z } from 'zod'

/** Staff back office (RFC-006 A1–A5). */
export const adminRouter = createTRPCRouter({
  listInterpreters: adminProcedure
    .input(z.object({ status: z.enum(['pending', 'approved', 'rejected']) }))
    .query(async ({ input, ctx }) => {
      return ctx.interpretersService.listForReview(input.status)
    }),

  reviewInterpreter: adminProcedure.input(interpreterReviewSchema).mutation(async ({ input, ctx }) => {
    const result = await ctx.interpretersService.review(ctx.user!.id, input)
    await notifyInterpreterReview({ userId: input.userId, status: input.decision, reason: input.reason })
    return result
  }),
})
