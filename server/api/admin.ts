import { notifyInterpreterReview } from '@/lib/email/interpreter-review'
import { setCastingStatusSchema } from '@/lib/validators/casting'
import { callResultSchema } from '@/lib/validators/votes'
import { callUpsertSchema, reviewEntrySchema, setCallPhaseSchema } from '@/lib/validators/calls'
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

  listCalls: adminProcedure.query(async ({ ctx }) => {
    return ctx.callsAdminService.listCalls()
  }),

  getCall: adminProcedure.input(z.object({ id: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.callsAdminService.getCall(input.id)
  }),

  upsertCall: adminProcedure.input(callUpsertSchema).mutation(async ({ input, ctx }) => {
    return ctx.callsAdminService.upsertCall(ctx.user!.id, input)
  }),

  setCallPhase: adminProcedure.input(setCallPhaseSchema).mutation(async ({ input, ctx }) => {
    return ctx.callsAdminService.setPhase(input.callId, input.phase)
  }),

  listEntries: adminProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.callsAdminService.listEntries(input.callId)
  }),

  reviewEntry: adminProcedure.input(reviewEntrySchema).mutation(async ({ input, ctx }) => {
    return ctx.callsAdminService.reviewEntry(input)
  }),

  listCastings: adminProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.castingService.listForCall(input.callId)
  }),

  setCastingStatus: adminProcedure.input(setCastingStatusSchema).mutation(async ({ input, ctx }) => {
    return ctx.castingService.setStatus(input.submissionId, input.status)
  }),

  callResults: adminProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.votesService.getCounts(input.callId)
  }),

  setCallResult: adminProcedure.input(callResultSchema).mutation(async ({ input, ctx }) => {
    return ctx.votesService.setResult(input)
  }),
})
