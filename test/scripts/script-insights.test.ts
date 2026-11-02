import { buildScriptInsights } from '@/server/services/script-insights.mappers'
import { ScriptInsightsService } from '@/server/services/script-insights.service'
import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

const AUTHOR = 'author-1'
const SCRIPT = { id: 's1', title: 'O Abismo', status: 'published', publishedAt: null, pageCount: 90, authorId: AUTHOR }

describe('buildScriptInsights', () => {
  it('returns empty metrics without activity', () => {
    const result = buildScriptInsights({ script: SCRIPT, ratings: [], comments: [], reactions: [] })
    expect(result.ratings.average).toBeNull()
    expect(result.ratings.count).toBe(0)
    expect(result.ratings.distribution).toHaveLength(5)
    expect(result.comments).toEqual({ total: 0, uniqueCommenters: 0, byPage: [] })
    expect(result.reactions.every((r) => r.count === 0)).toBe(true)
    expect(result.script).not.toHaveProperty('authorId')
  })

  it('aggregates ratings, comments per page and reactions, leaving out the author', () => {
    const result = buildScriptInsights({
      script: SCRIPT,
      ratings: [{ score: 5 }, { score: 4 }, { score: 4 }],
      comments: [
        { pageNumber: 12, authorId: 'reader-1' },
        { pageNumber: 3, authorId: 'reader-2' },
        { pageNumber: 12, authorId: 'reader-2' },
        { pageNumber: 12, authorId: AUTHOR },
      ],
      reactions: [
        { emoji: '🔥', userId: 'reader-1' },
        { emoji: '🔥', userId: AUTHOR },
        { emoji: '👍', userId: 'reader-2' },
      ],
    })
    expect(result.ratings.average).toBe(4.3)
    expect(result.ratings.distribution.find((d) => d.stars === 4)?.count).toBe(2)
    expect(result.comments).toEqual({
      total: 3,
      uniqueCommenters: 2,
      byPage: [
        { page: 3, count: 1 },
        { page: 12, count: 2 },
      ],
    })
    expect(result.reactions).toEqual([
      { emoji: '👍', count: 1 },
      { emoji: '❤️', count: 0 },
      { emoji: '🔥', count: 1 },
    ])
  })
})

describe('ScriptInsightsService.getForAuthor', () => {
  function supabaseWithScript(script: Record<string, unknown> | null) {
    const chain = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(async () => ({ data: script, error: null })) }
    chain.select.mockReturnValue(chain)
    chain.eq.mockReturnValue(chain)
    return { from: vi.fn(() => chain) } as unknown as SupabaseClient
  }

  it('hides the metrics from anyone but the author', async () => {
    const service = new ScriptInsightsService(supabaseWithScript({ id: 's1', author_id: 'someone-else' }))
    await expect(service.getForAuthor('s1', AUTHOR)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns NOT_FOUND for a missing script', async () => {
    const service = new ScriptInsightsService(supabaseWithScript(null))
    await expect(service.getForAuthor('s1', AUTHOR)).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
