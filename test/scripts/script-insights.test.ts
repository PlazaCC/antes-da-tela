import { EMPTY_SCRIPT_READ_STATS } from '@/lib/types/script-reads'
import { buildScriptInsights, withReadCounts } from '@/server/services/script-insights.mappers'
import { ScriptInsightsService } from '@/server/services/script-insights.service'
import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

const AUTHOR = 'author-1'
const SCRIPT = { id: 's1', title: 'O Abismo', status: 'published', publishedAt: null, pageCount: 90, authorId: AUTHOR }

describe('buildScriptInsights', () => {
  it('returns empty metrics without activity', () => {
    const result = buildScriptInsights({ script: SCRIPT, ratings: [], comments: [], reactions: [], reads: EMPTY_SCRIPT_READ_STATS })
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
      reads: EMPTY_SCRIPT_READ_STATS,
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

describe('withReadCounts', () => {
  it('adds readers per script and overall, zero for scripts nobody read', () => {
    const metrics = {
      scripts: [
        { id: 's1', title: 'A', status: 'published', avgRating: null, ratingCount: 0, commentCount: 0 },
        { id: 's2', title: 'B', status: 'draft', avgRating: null, ratingCount: 0, commentCount: 0 },
      ],
      avgRating: null,
      ratingCount: 0,
      totalComments: 0,
      totalScripts: 2,
      publishedScripts: 1,
    }
    const result = withReadCounts(metrics, {
      uniqueReaders: 7,
      newLast30: 3,
      newPrev30: 1,
      scripts: [{ scriptId: 's1', readers: 7, completed: 2 }],
    })
    expect(result.scripts.map((s) => [s.readers, s.completedReads])).toEqual([
      [7, 2],
      [0, 0],
    ])
    expect(result.readers).toEqual({ unique: 7, newLast30: 3, newPrev30: 1 })
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
