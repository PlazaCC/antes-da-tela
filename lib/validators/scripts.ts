import { AGE_RATINGS, GENRES } from '@/lib/constants/scripts'
import { z } from 'zod'

export const scriptCreateSchema = z.object({
  title: z.string().min(1).max(200),
  logline: z.string().max(300).optional(),
  synopsis: z.string().max(2000).optional(),
  genre: z.enum(GENRES).optional(),
  ageRating: z.enum(AGE_RATINGS).optional(),
  storagePath: z.string().min(1),
  fileSize: z.number().int().positive().optional(),
  pageCount: z.number().int().positive().optional(),
  bannerPath: z.string().optional(),
  audioStoragePath: z.string().optional(),
  audioDurationSeconds: z.number().int().positive().optional(),
  // authorId is read from the session — never accepted from client input
})

export type ScriptCreateInput = z.infer<typeof scriptCreateSchema>
