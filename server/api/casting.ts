import { castingSubmitSchema } from '@/lib/validators/casting'
import { authenticatedProcedure, createTRPCRouter } from '@/trpc/init'
import { z } from 'zod'

export const castingRouter = createTRPCRouter({
  // E7: characters open to the caller (approved interpreter) in a call, with their own take.
  openCharacters: authenticatedProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.castingService.openCharacters(ctx.user!.id, input.callId)
  }),

  // E8: send or replace a take.
  submit: authenticatedProcedure.input(castingSubmitSchema).mutation(async ({ input, ctx }) => {
    return ctx.castingService.submit(ctx.user!.id, input)
  }),

  withdraw: authenticatedProcedure.input(z.object({ submissionId: z.uuid() })).mutation(async ({ input, ctx }) => {
    return ctx.castingService.withdraw(ctx.user!.id, input.submissionId)
  }),

  // E6: the author's shortlist per character, and the pick.
  shortlist: authenticatedProcedure.input(z.object({ entryId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.castingService.shortlistForEntry(input.entryId)
  }),

  selectCast: authenticatedProcedure.input(z.object({ submissionId: z.uuid() })).mutation(async ({ input, ctx }) => {
    return ctx.castingService.selectCast(input.submissionId)
  }),
})
