import type { CallPhase } from '@/lib/constants/calls'
import type { InterpreterModality } from '@/lib/constants/interpreters'
import type { ReviewStatus } from '@/lib/types/interpreters'

export type CallSummary = {
  id: string
  slug: string
  title: string
  partner: string | null
  phase: CallPhase
  submissionsEndAt: string | null
  castingEndAt: string | null
  votingStartAt: string | null
  votingEndAt: string | null
}

export type Call = CallSummary & { description: string | null; rules: string | null }

export type CallCharacter = {
  id: string
  name: string
  description: string | null
  apparentAge: string | null
  gender: string | null
  traits: string[]
  modalities: InterpreterModality[]
  reference: string | null
}

export type EntryScript = {
  id: string
  title: string
  logline: string | null
  genre: string | null
  coverUrl: string | null
  authorName: string
}

export type CallEntry = {
  id: string
  callId: string
  status: ReviewStatus
  reviewReason: string | null
  createdAt: string
  script: EntryScript
  characters: CallCharacter[]
}

/** The author's published scripts that can still be entered, with their cast (to seed the entry). */
export type EligibleScript = {
  id: string
  title: string
  characters: Array<Pick<CallCharacter, 'name' | 'description' | 'apparentAge' | 'gender' | 'traits'>>
}
