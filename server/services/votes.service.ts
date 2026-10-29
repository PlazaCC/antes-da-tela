import { getPrivateAssetUrl } from '@/lib/storage/private-url'
import type { CallEntry, CastMember } from '@/lib/types/calls'
import type { CallResultInput } from '@/lib/validators/votes'
import { dbError, ENTRY_COLUMNS, toCallEntry } from '@/server/services/calls.mappers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'

type CastRow = {
  entry_id: string
  character_id: string
  character_name: string
  interpreter_id: string
  interpreter_name: string
  media_path: string
  media_type: 'video' | 'audio'
}

/** Voting, results and the chosen cast (RFC-006 phase 5). */
export class VotesService {
  constructor(private supabase: SupabaseClient) {}

  async getEntry(callId: string, entryId: string): Promise<CallEntry | null> {
    const { data, error } = await this.supabase
      .from('call_entries')
      .select(ENTRY_COLUMNS)
      .eq('id', entryId)
      .eq('call_id', callId)
      .eq('status', 'approved')
      .maybeSingle()
    if (error) dbError(error.message)
    return data ? toCallEntry(data) : null
  }

  /** Selected interpreters of every entry; empty before the voting phase (RPC rule). */
  async getCast(callId: string): Promise<CastMember[]> {
    const { data, error } = await this.supabase.rpc('get_call_cast', { p_call_id: callId })
    if (error) dbError(error.message)
    return Promise.all(
      ((data ?? []) as CastRow[]).map(async (row) => ({
        entryId: row.entry_id,
        characterId: row.character_id,
        characterName: row.character_name,
        interpreterId: row.interpreter_id,
        interpreterName: row.interpreter_name,
        mediaUrl: await getPrivateAssetUrl(row.media_path),
        mediaType: row.media_type,
      })),
    )
  }

  /** Votes per entry once the call is finished (or for admins); null otherwise. */
  async getCounts(callId: string): Promise<Record<string, number> | null> {
    const { data, error } = await this.supabase.rpc('call_vote_counts', { p_call_id: callId })
    if (error) dbError(error.message)
    const rows = (data ?? []) as Array<{ entry_id: string; votes: number }>
    return rows.length ? Object.fromEntries(rows.map((row) => [row.entry_id, Number(row.votes)])) : null
  }

  async getMyVote(userId: string, callId: string): Promise<string | null> {
    const { data, error } = await this.supabase.from('call_votes').select('entry_id').eq('call_id', callId).eq('user_id', userId).maybeSingle()
    if (error) dbError(error.message)
    return data?.entry_id ?? null
  }

  async vote(userId: string, callId: string, entryId: string): Promise<void> {
    const { error } = await this.supabase.from('call_votes').insert({ call_id: callId, entry_id: entryId, user_id: userId })
    if (error?.code === '23505') throw new TRPCError({ code: 'CONFLICT', message: 'Você já votou neste edital.' })
    if (error?.code === '42501') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Para votar, cadastre um documento e vote enquanto a votação estiver aberta.' })
    }
    if (error) dbError(error.message)
  }

  /** A5 — admin RLS on calls. */
  async setResult(input: CallResultInput): Promise<void> {
    const { error } = await this.supabase
      .from('calls')
      .update({
        winner_entry_id: input.winnerEntryId,
        live_at: input.liveAt?.toISOString() ?? null,
        live_url: input.liveUrl,
        ticket_url: input.ticketUrl,
        ticket_price_cents: input.ticketPriceCents,
        cast_share_percent: input.castSharePercent,
        recording_url: input.recordingUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.callId)
    if (error) dbError(error.message)
  }
}
