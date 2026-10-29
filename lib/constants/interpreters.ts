/**
 * Interpreter registration rules (RFC-006 phase 2, decisions D3–D5).
 *
 * Used by:
 *   - lib/validators/interpreter.ts (Zod)
 *   - app/api/upload/presign/route.ts (content types and size caps)
 *   - components/interpreter/*
 *
 * Keep INTERPRETER_MODALITIES in sync with the `interpreter_modality` enum in server/db/schema.ts.
 */

export const INTERPRETER_MODALITIES = ['acting', 'narration'] as const
export type InterpreterModality = (typeof INTERPRETER_MODALITIES)[number]

export const MODALITY_LABELS: Record<InterpreterModality, string> = {
  acting: 'Atuar',
  narration: 'Narrar',
}

export const MAX_MEDIA_SECONDS = 30
export const MIN_INTERPRETER_AGE = 18

export type InterpreterMediaKind = 'video' | 'audio'

export const INTERPRETER_MEDIA: Record<InterpreterMediaKind, { contentTypes: readonly string[]; maxBytes: number; hint: string }> = {
  video: {
    contentTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxBytes: 80 * 1024 * 1024,
    hint: 'mp4, webm ou mov — até 30 segundos e 80 MB',
  },
  audio: {
    contentTypes: ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav', 'audio/webm'],
    maxBytes: 10 * 1024 * 1024,
    hint: 'mp3, m4a, wav ou webm — até 30 segundos e 10 MB',
  },
}

/** D3: acting (alone or with narration) sends a video; narration only sends an audio. */
export function requiredMediaKind(modalities: readonly InterpreterModality[]): InterpreterMediaKind {
  return modalities.includes('acting') ? 'video' : 'audio'
}

/** D5: interpreters must be adults. `birthDate` is an ISO date (YYYY-MM-DD). */
export function isAdult(birthDate: string, today: Date = new Date()): boolean {
  const [year, month, day] = birthDate.split('-').map(Number)
  if (!year || !month || !day) return false
  const cutoff = new Date(Date.UTC(today.getUTCFullYear() - MIN_INTERPRETER_AGE, today.getUTCMonth(), today.getUTCDate()))
  return Date.UTC(year, month - 1, day) <= cutoff.getTime()
}

// D4: provisional wording — the team will replace it with the reviewed text.
export const CONSENT_TEXT =
  'Autorizo o Antes da Tela a usar minha imagem e voz no material enviado para fins de curadoria, divulgação dos editais e exibição na plataforma.'
