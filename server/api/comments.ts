import { REACTION_EMOJIS } from '@/lib/constants/reactions'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const commentsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        pageNumber: z.number().int().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.commentsService.list(input.scriptId, input.pageNumber)
    }),

  create: authenticatedProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        pageNumber: z.number().int().min(1),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.commentsService.create(input.scriptId, input.pageNumber, input.content, ctx.user!.id)
    }),

  countByScript: publicProcedure
    .input(z.object({ scriptId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return ctx.commentsService.countByScript(input.scriptId)
    }),

  delete: authenticatedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.commentsService.delete(input.commentId, ctx.user!.id)
    }),

  listReactionsByPage: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        pageNumber: z.number().int().min(1),
        currentUserId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return ctx.commentsService.listReactionsByPage(input.scriptId, input.pageNumber, input.currentUserId)
    }),

  toggleReaction: authenticatedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        emoji: z.enum(REACTION_EMOJIS),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.commentsService.toggleReaction(input.commentId, input.emoji, ctx.user!.id)
    }),
})
