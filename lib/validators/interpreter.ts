import { INTERPRETER_MODALITIES, isAdult, MAX_MEDIA_SECONDS, requiredMediaKind } from '@/lib/constants/interpreters'
import { z } from 'zod'

export const interpreterSubmissionSchema = z
  .object({
    modalities: z
      .array(z.enum(INTERPRETER_MODALITIES))
      .min(1, 'Escolha atuar, narrar ou os dois')
      .transform((list) => [...new Set(list)]),
    mediaPath: z.string().startsWith('interpreters/').max(300),
    mediaType: z.enum(['video', 'audio']),
    durationSeconds: z.number().int().min(1).max(MAX_MEDIA_SECONDS, `Máximo de ${MAX_MEDIA_SECONDS} segundos`),
    birthDate: z.iso.date('Data inválida').refine((date) => isAdult(date), 'É preciso ter 18 anos ou mais'),
    experience: z.string().trim().max(1000).optional(),
    ageRange: z.string().trim().max(40).optional(),
    languages: z.string().trim().max(120).optional(),
    drt: z.string().trim().max(30).optional(),
    consent: z.literal(true, 'É preciso aceitar o termo de uso de imagem e voz'),
  })
  .refine((value) => value.mediaType === requiredMediaKind(value.modalities), {
    message: 'Quem atua envia vídeo; quem só narra envia áudio',
    path: ['mediaType'],
  })

export type InterpreterSubmission = z.input<typeof interpreterSubmissionSchema>

export const interpreterReviewSchema = z
  .object({
    userId: z.uuid(),
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((value) => value.decision === 'approved' || !!value.reason, {
    message: 'Informe o motivo da reprovação',
    path: ['reason'],
  })
