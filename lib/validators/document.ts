import { DOCUMENT_TYPES, documentError } from '@/lib/utils/documents'
import { z } from 'zod'

/** Identity document form/API input. Shared by the profile form and `users.upsertDocument`. */
export const documentSchema = z
  .object({
    type: z.enum(DOCUMENT_TYPES),
    number: z.string().max(40),
    country: z.string().max(2),
  })
  .superRefine((value, ctx) => {
    const error = documentError(value.type, value.number, value.country)
    if (error) ctx.addIssue({ code: 'custom', message: error.message, path: [error.field] })
  })

export type DocumentFormValues = z.infer<typeof documentSchema>
