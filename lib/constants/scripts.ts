/**
 * Shared script domain constants.
 *
 * Used by:
 *   - server/api/scripts.ts  (Zod schema + DB queries)
 *   - lib/dev-mocks.ts       (dev-only form auto-fill)
 *
 * Keep in sync with the `script_status` enum in server/db/schema.ts.
 */

export const MACRO_GENRES = [
  'ação',
  'animação',
  'aventura',
  'comédia',
  'crime',
  'documentário',
  'drama',
  'experimental',
  'fantasia',
  'faroeste',
  'ficção científica',
  'guerra',
  'histórico',
  'musical',
  'romance',
  'terror',
  'thriller',
  'outro',
] as const

export const GENRES = [
  ...MACRO_GENRES,
  // ação
  'artes marciais',
  'catástrofe',
  'espionagem',
  'heist/assalto',
  'super-herói',
  // animação
  'anime',
  'stop-motion',
  // aventura
  'exploração',
  'piratas',
  'sobrevivência',
  // comédia
  'comédia negra',
  'mockumentary',
  'pastelão',
  'rom-com',
  'sitcom',
  // crime
  'máfia',
  'procedural',
  'true crime',
  // drama
  'coming-of-age',
  'familiar',
  'jurídico',
  'médico',
  'melodrama',
  // fantasia
  'alta fantasia',
  'conto de fadas',
  'espada e feitiçaria',
  'isekai',
  'urbana',
  // ficção científica
  'biopunk',
  'cyberpunk',
  'pós-apocalíptico',
  'space opera',
  'viagem no tempo',
  // histórico
  'biopic',
  'docudrama',
  'épico',
  // terror
  'body horror',
  'found footage',
  'slasher',
  'sobrenatural',
  // thriller
  'conspiração',
  'noir',
  'psicológico',
  'stalker',
  'techno-thriller',
  // tendências transversais
  'cozy',
  'dark academia',
  'dystopian ya',
  'elevated horror',
  'slow burn',
] as const

export type Genre = (typeof GENRES)[number]

export const GENRE_COMBINATIONS: Record<string, readonly string[]> = {
  'ação':           ['espionagem', 'super-herói', 'heist/assalto', 'artes marciais', 'thriller'],
  'animação':       ['anime', 'fantasia', 'aventura', 'comédia', 'ficção científica'],
  'aventura':       ['sobrevivência', 'exploração', 'ação', 'fantasia', 'histórico'],
  'comédia':        ['rom-com', 'comédia negra', 'mockumentary', 'romance', 'sitcom'],
  'crime':          ['noir', 'máfia', 'true crime', 'thriller', 'procedural'],
  'documentário':   ['true crime', 'biopic', 'docudrama', 'épico'],
  'drama':          ['coming-of-age', 'familiar', 'slow burn', 'jurídico', 'médico'],
  'experimental':   ['psicológico', 'drama', 'noir', 'urbana'],
  'fantasia':       ['alta fantasia', 'isekai', 'urbana', 'aventura', 'conto de fadas'],
  'faroeste':       ['épico', 'crime', 'thriller', 'histórico'],
  'ficção científica': ['cyberpunk', 'pós-apocalíptico', 'viagem no tempo', 'thriller', 'dystopian ya'],
  'guerra':         ['épico', 'drama', 'espionagem', 'histórico'],
  'histórico':      ['épico', 'biopic', 'docudrama', 'drama', 'guerra'],
  'musical':        ['rom-com', 'drama', 'biopic', 'comédia'],
  'romance':        ['rom-com', 'coming-of-age', 'slow burn', 'drama', 'épico'],
  'terror':         ['sobrenatural', 'psicológico', 'elevated horror', 'slasher', 'found footage'],
  'thriller':       ['psicológico', 'noir', 'conspiração', 'slow burn', 'techno-thriller'],
  'outro':          [],
}

export const AGE_RATINGS = ['livre', '10', '12', '14', '16', '18'] as const

export type AgeRating = (typeof AGE_RATINGS)[number]

/** Maximum number of subgenres a script may have (item 4). */
export const MAX_SUBGENRES = 3

/** Preset categories for an attached audio file (item 3). */
export const AUDIO_CATEGORIES = ['Podcast', 'Roteiro falado', 'Entrevista', 'Trilha', 'Outro'] as const

export type AudioCategory = (typeof AUDIO_CATEGORIES)[number]

/** Default category applied to audio rows created before the multi-audio migration (item 10). */
export const DEFAULT_AUDIO_CATEGORY: AudioCategory = 'Roteiro falado'

export function formatAgeRating(r: string): string {
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
