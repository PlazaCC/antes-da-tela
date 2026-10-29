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

/** Result and live (phases 5–6); the live and ticket are external links for now. */
export type CallResult = {
  winnerEntryId: string | null
  liveAt: string | null
  liveUrl: string | null
  ticketUrl: string | null
  ticketPriceCents: number | null
  castSharePercent: number | null
  recordingUrl: string | null
}

export type Call = CallSummary & { description: string | null; rules: string | null; result: CallResult }

/** A selected interpreter of an entry, public from the voting phase on. */
export type CastMember = {
  entryId: string
  characterId: string
  characterName: string
  interpreterId: string
  interpreterName: string
  mediaUrl: string | null
  mediaType: 'video' | 'audio'
}

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
