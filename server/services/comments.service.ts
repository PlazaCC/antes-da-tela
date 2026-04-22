import { TRPCError } from '@trpc/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { aggregateReactions } from '@/server/domain/reactions'
import type { CommentWithAuthor, ReactionSummary } from '@/lib/types'

export class CommentsService {
  constructor(private supabase: SupabaseClient) {}

  async list(scriptId: string, pageNumber: number) {
    const { data, error } = await this.supabase
      .from('comments')
      .select('id, script_id, page_number, content, created_at, author:users!author_id(id, name, image)')
      .eq('script_id', scriptId)
      .eq('page_number', pageNumber)
      .is('deleted_at', null)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const rows = data ?? []
    if (!rows.length) return [] as CommentWithAuthor[]

    const { data: reactionData } = await this.supabase
      .from('comment_reactions')
      .select('comment_id')
      .in('comment_id', rows.map((c) => c.id))

    const counts = new Map<string, number>()
    for (const r of reactionData ?? []) {
      counts.set(r.comment_id, (counts.get(r.comment_id) ?? 0) + 1)
    }

    return rows
      .map((row: any) => ({
        ...row,
        author: Array.isArray(row.author) ? row.author[0] : (row.author ?? null),
      }))
      .sort((a, b) => {
        const diff = (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)
        return diff !== 0 ? diff : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }) as CommentWithAuthor[]
  }

  async create(scriptId: string, pageNumber: number, content: string, userId: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .insert({
        script_id: scriptId,
        page_number: pageNumber,
        content,
        author_id: userId,
      })
      .select('id, script_id, page_number, content, created_at, author:users!author_id(id, name, image)')
      .single()

    if (error || !data) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message ?? 'Failed to create comment',
      })
    }

    const comment = data as any
    return {
      ...comment,
      author: Array.isArray(comment.author) ? comment.author[0] : (comment.author ?? null),
    } as CommentWithAuthor
  }

  async countByScript(scriptId: string) {
    const { count, error } = await this.supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('script_id', scriptId)
      .is('deleted_at', null)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    return { count: count ?? 0 }
  }

  async delete(commentId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('author_id', userId)
      .select('id')

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    if (!data?.length) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Comment not found or not owned by you' })
    }
  }

  async listReactionsByPage(scriptId: string, pageNumber: number, currentUserId?: string) {
    const { data: commentData } = await this.supabase
      .from('comments')
      .select('id')
      .eq('script_id', scriptId)
      .eq('page_number', pageNumber)
      .is('deleted_at', null)

    if (!commentData?.length) return {} as Record<string, ReactionSummary[]>

    const commentIds = commentData.map((c) => c.id)

    const { data, error } = await this.supabase
      .from('comment_reactions')
      .select('comment_id, emoji, user_id')
      .in('comment_id', commentIds)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    return aggregateReactions(data ?? [], currentUserId)
  }

  async toggleReaction(commentId: string, emoji: string, userId: string) {
    const { data: comment } = await this.supabase
      .from('comments')
      .select('author_id')
      .eq('id', commentId)
      .maybeSingle()

    if (!comment) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' })
    }

    if (comment.author_id === userId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot react to your own comment' })
    }

    const { data: existing } = await this.supabase
      .from('comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .maybeSingle()

    if (existing) {
      const { error } = await this.supabase.from('comment_reactions').delete().eq('id', existing.id)
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return { reacted: false }
    }

    const { error } = await this.supabase
      .from('comment_reactions')
      .insert({ comment_id: commentId, user_id: userId, emoji })
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return { reacted: true }
  }
}
