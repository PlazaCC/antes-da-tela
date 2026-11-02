import type { InterpreterModality } from '@/lib/constants/interpreters'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type InterpreterProfile = {
  userId: string
  modalities: InterpreterModality[]
  status: ReviewStatus
  mediaPath: string
  mediaType: 'video' | 'audio'
  mediaUrl: string | null
  durationSeconds: number
  birthDate: string
  experience: string | null
  ageRange: string | null
  languages: string | null
  drt: string | null
  rejectionReason: string | null
  updatedAt: string
}

export type InterpreterForReview = InterpreterProfile & { name: string; displayName: string | null; image: string | null }

export type InterpreterBadge = { modalities: InterpreterModality[]; mediaType: 'video' | 'audio'; mediaUrl: string | null }
