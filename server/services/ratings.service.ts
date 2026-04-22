import { TRPCError } from '@trpc/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateRatingDistribution } from '@/server/domain/ratings'

export class RatingsService {
  constructor(private supabase: SupabaseClient) {}

  async upsertRating(scriptId: string, userId: string, score: number) {
    const { data: script } = await this.supabase
      .from('scripts')
      .select('author_id')
      .eq('id', scriptId)
      .maybeSingle()

    if (script?.author_id === userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You cannot rate your own script.',
      })
    }

    const { error } = await this.supabase
      .from('ratings')
      .upsert({ script_id: scriptId, user_id: userId, score }, { onConflict: 'script_id,user_id' })

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }
  }

  async getAverage(scriptId: string) {
    const { data, error } = await this.supabase.rpc('get_average_rating', { p_script_id: scriptId }).single()

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const result = data as { average: number; total: number } | null
    return {
      average: Number(result?.average ?? 0),
      total: Number(result?.total ?? 0),
    }
  }

  async getManyAverage(scriptIds: string[]) {
    if (scriptIds.length === 0) return {}

    const { data, error } = await this.supabase.rpc('get_many_average_ratings', { p_script_ids: scriptIds })

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const map: Record<string, { average: number; total: number }> = {}
    for (const id of scriptIds) {
      map[id] = { average: 0, total: 0 }
    }

    for (const row of data ?? []) {
      if (row.script_id) {
        map[row.script_id] = {
          average: Number(row.average ?? 0),
          total: Number(row.total ?? 0),
        }
      }
    }

    return map
  }

  async getUserRating(scriptId: string, userId: string) {
    const { data } = await this.supabase
      .from('ratings')
      .select('score')
      .eq('script_id', scriptId)
      .eq('user_id', userId)
      .maybeSingle()

    return (data?.score as number | null) ?? null
  }

  async getStats(scriptId: string) {
    const { data, error } = await this.supabase
      .from('ratings')
      .select('score')
      .eq('script_id', scriptId)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const scores = ((data ?? []) as Array<{ score: number }>).map((row) => Number(row.score))
    const average = Number((scores.reduce((a, b) => a + b, 0) / (scores.length || 1)).toFixed(1))
    const distribution = calculateRatingDistribution(scores)

    return { average, total: scores.length, distribution }
  }
}
