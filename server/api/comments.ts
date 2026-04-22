import { REACTION_EMOJIS } from '@/lib/constants/reactions'
import { aggregateReactions } from '@/server/domain/reactions'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export type ReactionSummary = { emoji: string; count: number; userReacted: boolean }

export type CommentAuthor = { id: string; name: string | null; image: string | null }

export type CommentWithAuthor = {
  id: string
  script_id: string
  page_number: number
  content: string
  created_at: string
  author: CommentAuthor | null
}

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
        .select('id, script_id, page_number, content, created_at, author:users!author_id(id, name, image)')
        .eq('script_id', input.scriptId)
        .eq('page_number', input.pageNumber)
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      const rows = data ?? []
      if (!rows.length) return [] as CommentWithAuthor[]

      const { data: reactionData } = await ctx.supabase
        .from('comment_reactions')
        .select('comment_id')
        .in('comment_id', rows.map((c) => c.id))

      const counts = new Map<string, number>()
      for (const r of reactionData ?? []) {
        counts.set(r.comment_id, (counts.get(r.comment_id) ?? 0) + 1)
      }

      return [...rows].sort((a, b) => {
        const diff = (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)
        return diff !== 0 ? diff : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }) as unknown as CommentWithAuthor[]
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
        .select('id, script_id, page_number, content, created_at, author:users!author_id(id, name, image)')
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error?.message ?? 'Failed to create comment',
        })
      }

      return data as unknown as CommentWithAuthor
    }),

  countByScript: publicProcedure
    .input(z.object({ scriptId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { count, error } = await ctx.supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('script_id', input.scriptId)
        .is('deleted_at', null)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { count: count ?? 0 }
    }),

  delete: authenticatedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Soft delete — only the comment author may delete. The .eq('author_id') filter
      // means 0 rows are returned when the caller does not own the comment.
      const { data, error } = await ctx.supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.commentId)
        .eq('author_id', ctx.user!.id)
        .select('id')

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      if (!data?.length) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Comment not found or not owned by you' })
      }
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
      const { data: commentData } = await ctx.supabase
        .from('comments')
        .select('id')
        .eq('script_id', input.scriptId)
        .eq('page_number', input.pageNumber)
        .is('deleted_at', null)

      if (!commentData?.length) return {} as Record<string, ReactionSummary[]>

      const commentIds = commentData.map((c) => c.id)

      const { data, error } = await ctx.supabase
        .from('comment_reactions')
        .select('comment_id, emoji, user_id')
        .in('comment_id', commentIds)

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return aggregateReactions(data ?? [], input.currentUserId)
    }),

  toggleReaction: authenticatedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        emoji: z.enum(REACTION_EMOJIS),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id

      const { data: comment } = await ctx.supabase
        .from('comments')
        .select('author_id')
        .eq('id', input.commentId)
        .maybeSingle()

      if (!comment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' })
      }

      if (comment.author_id === userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot react to your own comment' })
      }

      const { data: existing } = await ctx.supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', input.commentId)
        .eq('user_id', userId)
        .eq('emoji', input.emoji)
        .maybeSingle()

      if (existing) {
        const { error } = await ctx.supabase.from('comment_reactions').delete().eq('id', existing.id)
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { reacted: false }
      }

      const { error } = await ctx.supabase
        .from('comment_reactions')
        .insert({ comment_id: input.commentId, user_id: userId, emoji: input.emoji })
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { reacted: true }
    }),
})
