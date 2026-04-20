/**
 * Shared script domain constants.
 *
 * Used by:
 *   - server/api/scripts.ts  (Zod schema + DB queries)
 *   - lib/dev-mocks.ts       (dev-only form auto-fill)
 *
 * Keep in sync with the `script_status` enum in server/db/schema.ts.
 */

export const GENRES = [
  'drama',
  'thriller',
  'comédia',
  'ficção científica',
  'terror',
  'romance',
  'documentário',
  'animação',
  'outro',
] as const

export type Genre = (typeof GENRES)[number]

export const AGE_RATINGS = ['livre', '10', '12', '14', '16', '18'] as const

export type AgeRating = (typeof AGE_RATINGS)[number]

export function formatAgeRating(r: AgeRating): string {
  return r === 'livre' ? 'Livre' : `${r} anos`
}
