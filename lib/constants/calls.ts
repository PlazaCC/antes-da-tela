/**
 * Script calls / editais (RFC-006 phase 3+).
 *
 * Keep CALL_PHASES in sync with the `call_phase` enum in server/db/schema.ts.
 */

export const CALL_PHASES = ['draft', 'submissions', 'casting', 'curation', 'voting', 'finished'] as const
export type CallPhase = (typeof CALL_PHASES)[number]

export const CALL_PHASE_LABELS: Record<CallPhase, string> = {
  draft: 'Rascunho',
  submissions: 'Inscrições abertas',
  casting: 'Casting',
  curation: 'Curadoria e elenco',
  voting: 'Votação',
  finished: 'Encerrado',
}

/** Phases shown on the public timeline, in order (draft is admin-only). */
export const PUBLIC_CALL_PHASES: readonly CallPhase[] = CALL_PHASES.filter((phase) => phase !== 'draft')

export function nextCallPhase(phase: CallPhase): CallPhase | null {
  const index = CALL_PHASES.indexOf(phase)
  return CALL_PHASES[index + 1] ?? null
}

export const CALL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
