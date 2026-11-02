import { MAX_MEDIA_SECONDS } from '@/lib/constants/interpreters'
import { z } from 'zod'

export const castingSubmitSchema = z.object({
  characterId: z.uuid(),
  media: z.discriminatedUnion('source', [
    // Reuse the presentation sent in the interpreter registration.
    z.object({ source: z.literal('profile') }),
    z.object({
      source: z.literal('upload'),
      path: z.string().startsWith('interpreters/').max(300),
      type: z.enum(['video', 'audio']),
      durationSeconds: z.number().int().min(1).max(MAX_MEDIA_SECONDS),
    }),
  ]),
  note: z.string().trim().max(500).optional(),
})
export type CastingSubmitInput = z.infer<typeof castingSubmitSchema>

export const setCastingStatusSchema = z.object({
  submissionId: z.uuid(),
  status: z.enum(['submitted', 'shortlisted', 'rejected']),
})
