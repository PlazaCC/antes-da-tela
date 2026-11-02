import { MAX_SHORTLIST } from '@/lib/constants/casting'
import type { InterpreterModality } from '@/lib/constants/interpreters'
import type { CharacterCasting, OpenCharacters } from '@/lib/types/casting'
import type { ReviewStatus } from '@/lib/types/interpreters'
import type { CastingSubmitInput } from '@/lib/validators/casting'
import { dbError } from '@/server/services/calls.mappers'
import { CHARACTER_COLUMNS, TAKE_COLUMNS, toCastingCharacter, toTake, withTakes, type Row } from '@/server/services/casting.mappers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'

const forbidden = (message: string): never => {
  throw new TRPCError({ code: 'FORBIDDEN', message })
}

/**
 * Casting (RFC-006 phase 4): interpreters send takes, the staff shortlists,
 * the author picks the cast. RLS + select_cast() gate each step by phase.
 */
export class CastingService {
  constructor(private supabase: SupabaseClient) {}

  private async callCharacters(callId: string): Promise<Row[]> {
    const { data, error } = await this.supabase
      .from('call_characters')
      .select(CHARACTER_COLUMNS)
      .eq('entry.call_id', callId)
      .eq('entry.status', 'approved')
      .order('sort_order', { ascending: true })
    if (error) dbError(error.message)
    return (data ?? []) as Row[]
  }

  /** E7: characters matching the interpreter's approved modalities, with their own take. */
  async openCharacters(userId: string, callId: string): Promise<OpenCharacters> {
    const { data: profile } = await this.supabase.from('interpreter_profiles').select('status, modalities').eq('user_id', userId).maybeSingle()
    const status = (profile?.status ?? null) as ReviewStatus | null
    if (status !== 'approved') return { interpreterStatus: status, characters: [] }

    const modalities = profile!.modalities as InterpreterModality[]
    const rows = (await this.callCharacters(callId)).filter((row) => (row.modalities as InterpreterModality[]).some((m) => modalities.includes(m)))
    const { data: takes, error } = await this.supabase
      .from('casting_submissions')
      .select(TAKE_COLUMNS)
      .eq('interpreter_id', userId)
      .in('character_id', rows.map((row) => row.id))
    if (error) dbError(error.message)

    const ownTakes = (takes ?? []) as Row[]
    const characters = await Promise.all(
      rows.map(async (row) => {
        const take = ownTakes.find((t) => t.character_id === row.id)
        return { ...toCastingCharacter(row), myTake: take ? await toTake(take) : null }
      }),
    )
    return { interpreterStatus: status, characters }
  }

  /** E8: send or replace the take for a character. */
  async submit(userId: string, input: CastingSubmitInput): Promise<void> {
    let media: { path: string; type: string; duration: number }
    if (input.media.source === 'profile') {
      const { data } = await this.supabase
        .from('interpreter_profiles')
        .select('media_path, media_type, duration_seconds')
        .eq('user_id', userId)
        .maybeSingle()
      if (!data) forbidden('Complete seu cadastro de intérprete antes de enviar castings.')
      media = { path: data!.media_path, type: data!.media_type, duration: data!.duration_seconds }
    } else {
      if (!input.media.path.startsWith(`interpreters/${userId}/`)) forbidden('Arquivo de mídia inválido.')
      media = { path: input.media.path, type: input.media.type, duration: input.media.durationSeconds }
    }

    const { error } = await this.supabase.from('casting_submissions').upsert(
      {
        character_id: input.characterId,
        interpreter_id: userId,
        media_path: media.path,
        media_type: media.type,
        duration_seconds: media.duration,
        note: input.note || null,
        status: 'submitted',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'character_id,interpreter_id' },
    )
    if (error?.code === '42501') forbidden('O casting deste edital não está aberto, ou seu cadastro de intérprete não está aprovado.')
    if (error) dbError(error.message)
  }

  async withdraw(userId: string, submissionId: string): Promise<void> {
    const { data, error } = await this.supabase.from('casting_submissions').delete().eq('id', submissionId).eq('interpreter_id', userId).select('id')
    if (error) dbError(error.message)
    if (!data?.length) forbidden('Só é possível retirar um casting ainda não avaliado, com o casting aberto.')
  }

  /** E6: the author's characters with the shortlisted/selected takes (RLS hides the rest). */
  async shortlistForEntry(entryId: string): Promise<CharacterCasting[]> {
    const { data: characters, error } = await this.supabase
      .from('call_characters')
      .select(CHARACTER_COLUMNS.replace('!inner', ''))
      .eq('entry_id', entryId)
      .order('sort_order', { ascending: true })
    if (error) dbError(error.message)
    const rows = (characters ?? []) as Row[]
    const { data: takes, error: takesError } = await this.supabase
      .from('casting_submissions')
      .select(TAKE_COLUMNS)
      .in('character_id', rows.map((c) => c.id))
    if (takesError) dbError(takesError.message)
    return withTakes(rows, ((takes ?? []) as Row[]).filter((t) => t.status === 'shortlisted' || t.status === 'selected'))
  }

  async selectCast(submissionId: string): Promise<void> {
    const { error } = await this.supabase.rpc('select_cast', { p_submission_id: submissionId })
    if (error?.code === '42501') forbidden('A escolha do elenco só é possível na fase de curadoria, entre as opções finalistas.')
    if (error) dbError(error.message)
  }

  /** A4: every take of every character of the call (admin RLS). */
  async listForCall(callId: string): Promise<CharacterCasting[]> {
    const characters = await this.callCharacters(callId)
    const { data: takes, error } = await this.supabase
      .from('casting_submissions')
      .select(TAKE_COLUMNS)
      .in('character_id', characters.map((c) => c.id))
      .order('created_at', { ascending: true })
    if (error) dbError(error.message)
    return withTakes(characters, (takes ?? []) as Row[])
  }

  /** A4: shortlist (max 3 per character), back to submitted, or reject. */
  async setStatus(submissionId: string, status: 'submitted' | 'shortlisted' | 'rejected'): Promise<void> {
    if (status === 'shortlisted') {
      const { data: take } = await this.supabase.from('casting_submissions').select('character_id').eq('id', submissionId).single()
      const { count } = await this.supabase
        .from('casting_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('character_id', take?.character_id)
        .in('status', ['shortlisted', 'selected'])
      if ((count ?? 0) >= MAX_SHORTLIST) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Máximo de ${MAX_SHORTLIST} finalistas por personagem.` })
      }
    }
    const { error } = await this.supabase.from('casting_submissions').update({ status, updated_at: new Date().toISOString() }).eq('id', submissionId)
    if (error) dbError(error.message)
  }
}
