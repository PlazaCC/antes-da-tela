import type { ReactionEmoji } from '@/lib/constants/reactions'

/** Per-script metrics shown to the author on /profile/scripts/[id]. */
export interface ScriptInsights {
  script: {
    id: string
    title: string
    status: string
    publishedAt: string | null
    pageCount: number | null
  }
  ratings: {
    /** null when there are no ratings yet. */
    average: number | null
    count: number
    /** Always five entries, 5 stars first. */
    distribution: Array<{ stars: number; count: number; percentage: number }>
  }
  /** Comments and reactions by other people; the author's own are not counted. */
  comments: {
    total: number
    uniqueCommenters: number
    /** Only pages with comments, in page order. */
    byPage: Array<{ page: number; count: number }>
  }
  reactions: Array<{ emoji: ReactionEmoji; count: number }>
}
