import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
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
      const { data, error } = await ctx.supabase
        .from('comments')
        .select('*, author:users!author_id(id, name, image)')
        .eq('script_id', input.scriptId)
        .eq('page_number', input.pageNumber)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ?? []
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
      const { data, error } = await ctx.supabase
        .from('comments')
        .insert({
          script_id: input.scriptId,
          page_number: input.pageNumber,
          content: input.content,
          author_id: ctx.user!.id,
        })
        .select('*, author:users!author_id(id, name, image)')
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message ?? 'Failed to create comment',
        })
      }

      return data
    }),

  delete: authenticatedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Soft delete — only the comment author can delete their own comment.
      // RLS enforces this at the DB level; this check provides a clear error.
      const { error } = await ctx.supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.commentId)
        .eq('author_id', ctx.user!.id)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }
    }),
})
