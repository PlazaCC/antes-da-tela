/** Below this many readers a percentage says more about chance than about the script. */
export const MIN_READERS_FOR_RATES = 5

/** Share of readers (0–100, rounded), or null when there are too few readers to show one. */
export function readRate(count: number, readers: number): number | null {
  if (readers < MIN_READERS_FOR_RATES) return null
  return Math.round((count / readers) * 100)
}

/** "+3 nos últimos 30 dias" for a reader card, or nothing when nobody new arrived. */
export function newReadersTrend(newLast30: number): string | undefined {
  return newLast30 > 0 ? `+${newLast30} nos últimos 30 dias` : undefined
}
