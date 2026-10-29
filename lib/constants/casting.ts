/** Casting (RFC-006 phase 4). Keep CASTING_STATUSES in sync with `casting_status` in server/db/schema.ts. */

export const CASTING_STATUSES = ['submitted', 'shortlisted', 'selected', 'rejected'] as const
export type CastingStatus = (typeof CASTING_STATUSES)[number]

export const CASTING_STATUS_LABELS: Record<CastingStatus, string> = {
  submitted: 'Enviado',
  shortlisted: 'Finalista',
  selected: 'Escolhido(a)',
  rejected: 'Não selecionado',
}

/** D9: the staff picks up to 3 options per character; the author chooses one. */
export const MAX_SHORTLIST = 3
