import { enterCallSchema, updateEntryCharactersSchema } from '@/lib/validators/calls'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const callsRouter = createTRPCRouter({
  // Public calls (no drafts), newest first.
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.callsService.list()
  }),

  // Call page: the call and its approved entries.
  getBySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(80) })).query(async ({ input, ctx }) => {
    return ctx.callsService.getBySlug(input.slug)
  }),

  myEntries: authenticatedProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.callsService.listMyEntries(ctx.user!.id, input.callId)
  }),

  eligibleScripts: authenticatedProcedure.input(z.object({ callId: z.uuid() })).query(async ({ input, ctx }) => {
    return ctx.callsService.listEligibleScripts(ctx.user!.id, input.callId)
  }),

  enter: authenticatedProcedure.input(enterCallSchema).mutation(async ({ input, ctx }) => {
    return ctx.callsService.enter(ctx.user!.id, input)
  }),

  updateCharacters: authenticatedProcedure.input(updateEntryCharactersSchema).mutation(async ({ input, ctx }) => {
    return ctx.callsService.updateCharacters(input.entryId, input.characters)
  }),

  withdraw: authenticatedProcedure.input(z.object({ entryId: z.uuid() })).mutation(async ({ input, ctx }) => {
    return ctx.callsService.withdraw(ctx.user!.id, input.entryId)
  }),
})
