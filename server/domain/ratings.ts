export function calculateAverageRating(scores: number[]): number {
  if (scores.length === 0) return 0
  return scores.reduce((sum, v) => sum + v, 0) / scores.length
}

export function roundRating(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

// Returns null (instead of 0) when there are no scores — used where "no rating yet" is semantically distinct.
export function calculateAverageRatingNullable(scores: number[]): number | null {
  if (scores.length === 0) return null
  return roundRating(calculateAverageRating(scores))
}

export function calculateRatingDistribution(scores: number[]): Array<{ stars: number; count: number; percentage: number }> {
  const total = scores.length
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const score of scores) {
    if (score >= 1 && score <= 5) counts[score] = (counts[score] ?? 0) + 1
  }
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: counts[stars],
    percentage: total > 0 ? (counts[stars] / total) * 100 : 0,
  }))
}
