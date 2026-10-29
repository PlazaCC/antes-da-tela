import {
  GENDER_OPTIONS,
  PREFERENCE_FORMATS,
  PREFERENCE_GENRES,
  PREFERENCE_GOALS,
  PREFERENCE_THEMES,
  USER_INTENTS,
} from '@/lib/constants/preferences'
import { z } from 'zod'

export const intentsSchema = z.object({
  intents: z.array(z.enum(USER_INTENTS)).min(1, 'Escolha pelo menos uma opção').max(USER_INTENTS.length),
})

export const genderSchema = z.object({ gender: z.enum(GENDER_OPTIONS).nullable() })

const uniqueList = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .array(z.enum(values))
    .max(values.length)
    .transform((list) => [...new Set(list)])

export const preferencesSchema = z.object({
  genres: uniqueList(PREFERENCE_GENRES as unknown as readonly [string, ...string[]]),
  formats: uniqueList(PREFERENCE_FORMATS),
  themes: uniqueList(PREFERENCE_THEMES),
  goals: uniqueList(PREFERENCE_GOALS),
})

export type PreferencesValues = z.input<typeof preferencesSchema>

/** Stored shape: every preference group as a plain string list. */
export type Preferences = Record<keyof PreferencesValues, string[]>
