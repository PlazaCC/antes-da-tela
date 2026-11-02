import { genderSchema, intentsSchema, preferencesSchema } from '@/lib/validators/onboarding'
import { authenticatedProcedure, createTRPCRouter } from '@/trpc/init'

export const onboardingRouter = createTRPCRouter({
  // The caller's intents, private gender and completion date.
  getState: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.onboardingService.getState(ctx.user!.id)
  }),

  setIntents: authenticatedProcedure.input(intentsSchema).mutation(async ({ input, ctx }) => {
    return ctx.onboardingService.update(ctx.user!.id, { intents: input.intents })
  }),

  setGender: authenticatedProcedure.input(genderSchema).mutation(async ({ input, ctx }) => {
    return ctx.onboardingService.update(ctx.user!.id, { gender: input.gender })
  }),

  complete: authenticatedProcedure.mutation(async ({ ctx }) => {
    return ctx.onboardingService.update(ctx.user!.id, { completedAt: new Date().toISOString() })
  }),

  getPreferences: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.onboardingService.getPreferences(ctx.user!.id)
  }),

  upsertPreferences: authenticatedProcedure.input(preferencesSchema).mutation(async ({ input, ctx }) => {
    return ctx.onboardingService.upsertPreferences(ctx.user!.id, input)
  }),
})
