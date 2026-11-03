import { REACTION_EMOJIS } from '@/lib/constants/reactions'
import type { ScriptInsights } from '@/lib/types/script-insights'
import type { AuthorReadCounts, ScriptReadStats } from '@/lib/types/script-reads'
import type { DashboardMetrics } from '@/lib/types/scripts'
import { calculateAverageRatingNullable, calculateRatingDistribution } from '@/server/domain/ratings'

export interface ScriptInsightsRows {
  script: ScriptInsights['script'] & { authorId: string }
  ratings: Array<{ score: number }>
  comments: Array<{ pageNumber: number; authorId: string }>
  reactions: Array<{ emoji: string; userId: string }>
  reads: ScriptReadStats
}

/** Aggregates raw rows into the author's per-script view, leaving out the author's own activity. */
export function buildScriptInsights({ script, ratings, comments, reactions, reads }: ScriptInsightsRows): ScriptInsights {
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
    reads,
  }
}

type DashboardMetricsRow = Omit<DashboardMetrics, 'readers' | 'scripts'> & {
  scripts: Array<Omit<DashboardMetrics['scripts'][number], 'readers' | 'completedReads'>>
}

/** Adds the author's reader counts (get_author_read_counts) to the dashboard metrics. */
export function withReadCounts(metrics: DashboardMetricsRow, counts: AuthorReadCounts): DashboardMetrics {
  const perScript = new Map(counts.scripts.map((s) => [s.scriptId, s]))
  return {
    ...metrics,
    scripts: metrics.scripts.map((s) => ({
      ...s,
      readers: perScript.get(s.id)?.readers ?? 0,
      completedReads: perScript.get(s.id)?.completed ?? 0,
    })),
    readers: { unique: counts.uniqueReaders, newLast30: counts.newLast30, newPrev30: counts.newPrev30 },
  }
}
