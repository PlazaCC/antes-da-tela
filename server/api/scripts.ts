import { scriptCreateSchema, scriptUpdateSchema } from '@/lib/validators/scripts'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const scriptsRouter = createTRPCRouter({
  create: authenticatedProcedure.input(scriptCreateSchema).mutation(async ({ input, ctx }) => {
    return ctx.scriptsService.create(input, ctx.user!.id, ctx.user!.user_metadata || null, ctx.user!.email ?? null)
  }),

  addAudioFile: authenticatedProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        storagePath: z.string().min(1),
        durationSeconds: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.scriptsService.addAudioFile(input.scriptId, input.storagePath, ctx.user!.id, input.durationSeconds)
    }),

  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.scriptsService.getById(input.id)
  }),

  listRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.scriptsService.listRecent(input.limit)
    }),

  listFeatured: publicProcedure.query(async ({ ctx }) => {
    return ctx.scriptsService.listFeatured()
  }),
  listTrendingBanners: publicProcedure.query(async ({ ctx }) => {
    return ctx.scriptsService.listTrendingBanners()
  }),

  listByAuthor: publicProcedure.input(z.object({ authorId: z.string().uuid() })).query(async ({ input, ctx }) => {
    return ctx.scriptsService.listByAuthor(input.authorId)
  }),

  getDashboardMetrics: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.scriptsService.getDashboardMetrics(ctx.user!.id)
  }),

  search: publicProcedure
    .input(
      z.object({
        query: z
          .string()
          .max(100)
          .regex(/^[\w\s\-áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]+$/u, 'Caracteres de busca inválidos')
          .optional(),
        genres: z.array(z.string()).optional(),
        ageRatings: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.scriptsService.search(input.query, input.genres, input.ageRatings)
    }),
  update: authenticatedProcedure.input(scriptUpdateSchema).mutation(async ({ input, ctx }) => {
    return ctx.scriptsService.update({ ...input, authorId: ctx.user!.id })
  }),

  delete: authenticatedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.scriptsService.delete(input.id, ctx.user!.id)
    }),
})
