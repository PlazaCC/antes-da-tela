import { REACTION_EMOJIS } from '@/lib/constants/reactions'
import type { ScriptInsights } from '@/lib/types/script-insights'
import { calculateAverageRatingNullable, calculateRatingDistribution } from '@/server/domain/ratings'

export interface ScriptInsightsRows {
  script: ScriptInsights['script'] & { authorId: string }
  ratings: Array<{ score: number }>
  comments: Array<{ pageNumber: number; authorId: string }>
  reactions: Array<{ emoji: string; userId: string }>
}

/** Aggregates raw rows into the author's per-script view, leaving out the author's own activity. */
export function buildScriptInsights({ script, ratings, comments, reactions }: ScriptInsightsRows): ScriptInsights {
  const { authorId, ...scriptInfo } = script

  const scores = ratings.map((r) => r.score)

  const others = comments.filter((c) => c.authorId !== authorId)
  const perPage = new Map<number, number>()
  for (const c of others) perPage.set(c.pageNumber, (perPage.get(c.pageNumber) ?? 0) + 1)

  return {
    script: scriptInfo,
    ratings: {
      average: calculateAverageRatingNullable(scores),
      count: scores.length,
      distribution: calculateRatingDistribution(scores),
    },
    comments: {
      total: others.length,
      uniqueCommenters: new Set(others.map((c) => c.authorId)).size,
      byPage: [...perPage].map(([page, count]) => ({ page, count })).sort((a, b) => a.page - b.page),
    },
    reactions: REACTION_EMOJIS.map((emoji) => ({
      emoji,
      count: reactions.filter((r) => r.emoji === emoji && r.userId !== authorId).length,
    })),
  }
}
