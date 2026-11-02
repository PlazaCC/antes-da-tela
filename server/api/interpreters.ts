import { interpreterSubmissionSchema } from '@/lib/validators/interpreter'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const interpretersRouter = createTRPCRouter({
  // The caller's registration (any status), with a short-lived media URL.
  getMine: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.interpretersService.getMine(ctx.user!.id)
  }),

  // Insert or resubmit — always goes (back) to curation.
  submit: authenticatedProcedure.input(interpreterSubmissionSchema).mutation(async ({ input, ctx }) => {
    return ctx.interpretersService.submit(ctx.user!.id, input)
  }),

  // Public profile badge: approved interpreters only.
  getBadge: publicProcedure.input(z.object({ userId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.interpretersService.getBadge(input.userId)
  }),
})
