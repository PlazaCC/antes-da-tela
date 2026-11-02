import { CALL_PHASES, CALL_SLUG_PATTERN } from '@/lib/constants/calls'
import { INTERPRETER_MODALITIES } from '@/lib/constants/interpreters'
import { MAX_CHARACTERS } from '@/lib/constants/scripts'
import { characterInputSchema } from '@/lib/validators/scripts'
import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional()

export const callUpsertSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string().trim().min(3).max(80).regex(CALL_SLUG_PATTERN, 'Use letras minúsculas, números e hífens'),
  title: z.string().trim().min(3).max(120),
  description: optionalText(4000),
  partner: optionalText(120),
  rules: optionalText(8000),
  submissionsEndAt: z.date().nullable().optional(),
  castingEndAt: z.date().nullable().optional(),
  votingStartAt: z.date().nullable().optional(),
  votingEndAt: z.date().nullable().optional(),
})
export type CallUpsertInput = z.infer<typeof callUpsertSchema>

export const setCallPhaseSchema = z.object({ callId: z.uuid(), phase: z.enum(CALL_PHASES) })

export const callCharacterSchema = characterInputSchema.extend({
  modalities: z
    .array(z.enum(INTERPRETER_MODALITIES))
    .min(1, 'Escolha atuar, narrar ou os dois')
    .transform((list) => [...new Set(list)]),
  reference: z.string().trim().max(200).optional(),
})
export type CallCharacterInput = z.input<typeof callCharacterSchema>

const charactersSchema = z.array(callCharacterSchema).min(1, 'Adicione pelo menos um personagem').max(MAX_CHARACTERS)

export const enterCallSchema = z.object({ callId: z.uuid(), scriptId: z.uuid(), characters: charactersSchema })

export const updateEntryCharactersSchema = z.object({ entryId: z.uuid(), characters: charactersSchema })

export const reviewEntrySchema = z
  .object({
    entryId: z.uuid(),
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.decision === 'approved' || !!value.reason, {
    message: 'Informe o motivo da recusa',
    path: ['reason'],
  })
