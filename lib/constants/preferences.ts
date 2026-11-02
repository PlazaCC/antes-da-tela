import { MACRO_GENRES } from '@/lib/constants/scripts'

/**
 * Onboarding and content-preference options (RFC-006).
 *
 * Used by:
 *   - lib/validators/onboarding.ts (Zod enums)
 *   - components/onboarding/*, components/preferences/*
 *
 * Keep USER_INTENTS in sync with the `user_intent` enum in server/db/schema.ts.
 */

export const USER_INTENTS = ['reader', 'producer', 'interpreter'] as const
export type UserIntent = (typeof USER_INTENTS)[number]

export const INTENT_OPTIONS: ReadonlyArray<{ value: UserIntent; title: string; description: string }> = [
  { value: 'reader', title: 'Quero ler roteiros', description: 'Descobrir, ler, avaliar e comentar roteiros.' },
  {
    value: 'producer',
    title: 'Quero publicar meus roteiros',
    description: 'Publicar, receber feedback e inscrever roteiros em editais.',
  },
  {
    value: 'interpreter',
    title: 'Quero interpretar',
    description: 'Atuar e/ou narrar personagens dos roteiros inscritos em editais.',
  },
]

export const PREFERENCE_GENRES = MACRO_GENRES.filter((genre) => genre !== 'outro')

export const PREFERENCE_FORMATS = ['longa', 'curta', 'série', 'roteiro falado'] as const

export const PREFERENCE_THEMES = [
  'família',
  'política',
  'identidade',
  'periferia',
  'LGBTQIA+',
  'histórico',
  'infantojuvenil',
  'relações',
  'trabalho',
] as const

export const PREFERENCE_GOALS = [
  'ler e descobrir roteiros',
  'dar e receber feedback',
  'descobrir talentos',
  'participar de editais',
] as const

export const PRONOUN_OPTIONS = ['ela/dela', 'ele/dele', 'elu/delu'] as const

export const GENDER_OPTIONS = ['mulher', 'homem', 'não binário', 'prefiro não dizer'] as const
export type Gender = (typeof GENDER_OPTIONS)[number]
