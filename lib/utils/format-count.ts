/** "1 avaliação", "3 avaliações" — count followed by the singular or plural noun. */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}
