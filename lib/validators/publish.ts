import { AGE_RATINGS, GENRES, MAX_SUBGENRES } from '@/lib/constants/scripts'
import { z } from 'zod'

export const publishFormSchema = z.object({
  title: z.string().min(1),
  logline: z.string().max(300).or(z.literal('')),
  synopsis: z.string().max(2000).or(z.literal('')),
  genre: z.enum(GENRES).or(z.literal('')),
  subgenres: z.array(z.enum(GENRES)).max(MAX_SUBGENRES),
  ageRating: z.enum(AGE_RATINGS).or(z.literal('')),
  bnRegistration: z.string().max(100).or(z.literal('')),
  pdfStoragePath: z.string().or(z.literal('')),
  coverStoragePath: z.string().or(z.literal('')),
  bannerStoragePath: z.string().or(z.literal('')),
  pitchDeckStoragePath: z.string().or(z.literal('')),
})

export type PublishFormValues = z.infer<typeof publishFormSchema>
