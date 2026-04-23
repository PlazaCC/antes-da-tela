import { AGE_RATINGS, GENRES } from '@/lib/constants/scripts'
import { z } from 'zod'

export const publishFormSchema = z.object({
  title: z.string().min(1),
  logline: z.string().max(300).or(z.literal('')),
  synopsis: z.string().max(2000).or(z.literal('')),
  genre: z.enum(GENRES).or(z.literal('')),
  ageRating: z.enum(AGE_RATINGS).or(z.literal('')),
  pdfStoragePath: z.string().or(z.literal('')),
  audioStoragePath: z.string().or(z.literal('')),
  coverStoragePath: z.string().or(z.literal('')),
  bannerStoragePath: z.string().or(z.literal('')),
})

export type PublishFormValues = z.infer<typeof publishFormSchema>
