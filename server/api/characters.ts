import { searchCharacterTraits } from '@/server/services/script-characters'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const charactersRouter = createTRPCRouter({
  suggestTraits: publicProcedure
    .input(
      z.object({
        query: z.string().trim().max(40).default(''),
        limit: z.number().int().min(1).max(20).default(8),
      }),
    )
    .query(async ({ input, ctx }) => {
      return searchCharacterTraits(ctx.supabase, input.query, input.limit)
    }),
})
