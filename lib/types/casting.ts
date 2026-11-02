import type { CastingStatus } from '@/lib/constants/casting'
import type { CallCharacter } from '@/lib/types/calls'
import type { ReviewStatus } from '@/lib/types/interpreters'

export type CastingTake = {
  id: string
  interpreterId: string
  interpreterName: string
  interpreterImage: string | null
  mediaUrl: string | null
  mediaType: 'video' | 'audio'
  durationSeconds: number
  note: string | null
  status: CastingStatus
}

/** A character with its entry/script context. */
export type CastingCharacter = CallCharacter & { entryId: string; scriptId: string; scriptTitle: string; authorName: string }

/** E7: a character open for casting, with the viewer's own take. */
export type OpenCharacter = CastingCharacter & { myTake: CastingTake | null }

export type OpenCharacters = { interpreterStatus: ReviewStatus | null; characters: OpenCharacter[] }

/** A4 (all takes) and E6 (shortlisted/selected only, by RLS). */
export type CharacterCasting = CastingCharacter & { takes: CastingTake[] }
