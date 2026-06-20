import { isValidCpf } from '@/lib/utils/cpf'
import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres').max(100),
  bio: z.string().max(500).optional(),
  // Stored as 11 digits only. Empty is allowed (CPF is only required to publish).
  cpf: z
    .string()
    .optional()
    .refine((v) => !v || isValidCpf(v), 'CPF inválido'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
