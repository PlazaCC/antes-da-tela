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

/** Maximum number of subgenres a script may have (item 4). */
export const MAX_SUBGENRES = 3

/** Preset categories for an attached audio file (item 3). */
export const AUDIO_CATEGORIES = ['Podcast', 'Roteiro falado', 'Entrevista', 'Trilha', 'Outro'] as const

export type AudioCategory = (typeof AUDIO_CATEGORIES)[number]

/** Default category applied to audio rows created before the multi-audio migration (item 10). */
export const DEFAULT_AUDIO_CATEGORY: AudioCategory = 'Roteiro falado'

export function formatAgeRating(r: AgeRating): string {
  return r === 'livre' ? 'Livre' : `${r} anos`
}

export const SCRIPT_STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
}

export const SCRIPT_STATUS_COLORS: Record<string, string> = {
  published: 'text-state-success',
  draft: 'text-text-muted',
}

export const SCRIPT_STATUS_BG_CLASSES: Record<string, string> = {
  published: 'bg-state-success/5 border-state-success/20 text-state-success',
  draft: 'bg-text-muted/5 border-text-muted/20 text-text-muted',
}
