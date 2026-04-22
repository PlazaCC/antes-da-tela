import type { ReactionSummary } from '@/server/api/comments'

export function aggregateReactions(
  rows: Array<{ comment_id: string; emoji: string; user_id: string }>,
  currentUserId?: string,
): Record<string, ReactionSummary[]> {
  const result: Record<string, ReactionSummary[]> = {}
  for (const row of rows) {
    if (!result[row.comment_id]) result[row.comment_id] = []
    const existing = result[row.comment_id].find((r) => r.emoji === row.emoji)
    if (existing) {
      existing.count++
      if (currentUserId && row.user_id === currentUserId) existing.userReacted = true
    } else {
      result[row.comment_id].push({
        emoji: row.emoji,
        count: 1,
        userReacted: !!(currentUserId && row.user_id === currentUserId),
      })
    }
  }
  return result
}
