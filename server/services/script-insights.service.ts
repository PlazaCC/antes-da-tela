import type { ScriptInsights } from '@/lib/types/script-insights'
import { EMPTY_SCRIPT_READ_STATS, type ScriptReadStats } from '@/lib/types/script-reads'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'
import { buildScriptInsights } from './script-insights.mappers'

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST rows are untyped here; mapped to typed shapes below. */
type Row = Record<string, any>

export class ScriptInsightsService {
  constructor(private supabase: SupabaseClient) {}

  /** Metrics for one script, only for its author (anyone else gets NOT_FOUND). */
  async getForAuthor(scriptId: string, userId: string): Promise<ScriptInsights> {
    const { data: script } = await this.supabase
      .from('scripts')
      .select('id, title, status, author_id, published_at, script_files(page_count)')
      .eq('id', scriptId)
      .maybeSingle()

    if (!script || script.author_id !== userId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Roteiro não encontrado.' })
    }

    const [ratings, comments, reactions, reads] = await Promise.all([
      this.supabase.from('ratings').select('score').eq('script_id', scriptId),
      this.supabase.from('comments').select('page_number, author_id').eq('script_id', scriptId).is('deleted_at', null),
      this.supabase
        .from('comment_reactions')
        .select('emoji, user_id, comment:comments!inner(script_id)')
        .eq('comment.script_id', scriptId),
      this.supabase.rpc('get_script_read_stats', { p_script_id: scriptId }),
    ])
    const failed = ratings.error ?? comments.error ?? reactions.error ?? reads.error
    if (failed) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: failed.message })

    const files = (script as Row).script_files
    return buildScriptInsights({
      script: {
        id: script.id,
        title: script.title,
        status: script.status,
        publishedAt: script.published_at,
        pageCount: (Array.isArray(files) ? files[0] : files)?.page_count ?? null,
        authorId: script.author_id,
      },
      ratings: (ratings.data as Row[]).map((r) => ({ score: Number(r.score) })),
      comments: (comments.data as Row[]).map((c) => ({ pageNumber: c.page_number, authorId: c.author_id })),
      reactions: (reactions.data as Row[]).map((r) => ({ emoji: r.emoji, userId: r.user_id })),
      reads: (reads.data as ScriptReadStats | null) ?? EMPTY_SCRIPT_READ_STATS,
    })
  }
}
