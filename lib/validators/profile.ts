import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres').max(100),
  bio: z.string().max(500).optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
