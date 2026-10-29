import { hasVerifiedEmail } from '@/lib/auth/email-verified'
import { castVoteSchema } from '@/lib/validators/votes'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const votesRouter = createTRPCRouter({
  // Shared entry page (/editais/[slug]/r/[entryId]): the approved entry.
  getEntry: publicProcedure.input(z.object({ callId: z.uuid(), entryId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.votesService.getEntry(input.callId, input.entryId)
  }),

  // Chosen cast (voting/finished) and totals (finished only).
  results: publicProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    const [cast, counts] = await Promise.all([ctx.votesService.getCast(input.callId), ctx.votesService.getCounts(input.callId)])
    return { cast, counts }
  }),

  // The caller's vote in the call and whether they can vote (verified e-mail).
  myVote: authenticatedProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    const [entryId, emailVerified] = await Promise.all([ctx.votesService.getMyVote(ctx.user!.id, input.callId), hasVerifiedEmail()])
    return { entryId, emailVerified }
  }),

  vote: authenticatedProcedure.input(castVoteSchema).mutation(async ({ input, ctx }) => {
    if (!(await hasVerifiedEmail())) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Confirme seu e-mail para votar.' })
    }
    return ctx.votesService.vote(ctx.user!.id, input.callId, input.entryId)
  }),
})
