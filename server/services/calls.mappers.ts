import { getAssetUrl } from '@/lib/storage/url'
import type { Call, CallCharacter, CallEntry, CallSummary } from '@/lib/types/calls'
import type { CallCharacterInput } from '@/lib/validators/calls'
import { TRPCError } from '@trpc/server'

export const CALL_SUMMARY_COLUMNS = 'id, slug, title, partner, phase, submissions_end_at, casting_end_at, voting_start_at, voting_end_at'
export const CALL_COLUMNS = `${CALL_SUMMARY_COLUMNS}, description, rules, winner_entry_id, live_at, live_url, ticket_url, ticket_price_cents, cast_share_percent, recording_url`

export const ENTRY_COLUMNS =
  'id, call_id, status, review_reason, created_at, ' +
  'script:scripts(id, title, logline, genre, cover_path, author:users!scripts_author_id_users_id_fk(name, display_name)), ' +
  'characters:call_characters(id, name, description, apparent_age, gender, traits, modalities, reference, sort_order)'

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST rows are untyped here; mapped to typed shapes below. */
type Row = Record<string, any>

const one = (value: unknown): Row => (Array.isArray(value) ? value[0] : value) as Row

export function toCallSummary(row: Row): CallSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    partner: row.partner,
    phase: row.phase,
    submissionsEndAt: row.submissions_end_at,
    castingEndAt: row.casting_end_at,
    votingStartAt: row.voting_start_at,
    votingEndAt: row.voting_end_at,
  }
}

export function toCall(row: Row): Call {
  return {
    ...toCallSummary(row),
    description: row.description,
    rules: row.rules,
    result: {
      winnerEntryId: row.winner_entry_id ?? null,
      liveAt: row.live_at ?? null,
      liveUrl: row.live_url ?? null,
      ticketUrl: row.ticket_url ?? null,
      ticketPriceCents: row.ticket_price_cents ?? null,
      castSharePercent: row.cast_share_percent ?? null,
      recordingUrl: row.recording_url ?? null,
    },
  }
}

export function toCallCharacter(row: Row): CallCharacter {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    apparentAge: row.apparent_age,
    gender: row.gender,
    traits: row.traits ?? [],
    modalities: row.modalities ?? [],
    reference: row.reference,
  }
}

export function toCallEntry(row: Row): CallEntry {
  const script = one(row.script)
  const author = one(script?.author)
  return {
    id: row.id,
    callId: row.call_id,
    status: row.status,
    reviewReason: row.review_reason,
    createdAt: row.created_at,
    script: {
      id: script.id,
      title: script.title,
      logline: script.logline,
      genre: script.genre,
      coverUrl: getAssetUrl(script.cover_path, 'avatars'),
      authorName: author?.display_name || author?.name || '',
    },
    characters: [...(row.characters ?? [])].sort((a: Row, b: Row) => a.sort_order - b.sort_order).map(toCallCharacter),
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function toCharacterRows(entryId: string, characters: CallCharacterInput[]) {
  return characters.map((character, index) => ({
    entry_id: entryId,
    name: character.name,
    description: character.description || null,
    apparent_age: character.apparentAge || null,
    gender: character.gender || null,
    traits: character.traits ?? [],
    modalities: [...new Set(character.modalities)],
    reference: character.reference || null,
    sort_order: index,
  }))
}

export function dbError(message: string): never {
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message })
}
