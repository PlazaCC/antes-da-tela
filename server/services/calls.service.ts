import type { Call, CallEntry, CallSummary, EligibleScript } from '@/lib/types/calls'
import type { CallCharacterInput } from '@/lib/validators/calls'
import {
  CALL_COLUMNS,
  CALL_SUMMARY_COLUMNS,
  dbError,
  ENTRY_COLUMNS,
  toCall,
  toCallEntry,
  toCallSummary,
  toCharacterRows,
} from '@/server/services/calls.mappers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'

/**
 * Script calls for visitors and authors (RFC-006 phase 3). RLS hides drafts,
 * shows only approved entries publicly and gates writes by the call phase.
 */
export class CallsService {
  constructor(private supabase: SupabaseClient) {}

  async list(): Promise<CallSummary[]> {
    const { data, error } = await this.supabase
      .from('calls')
      .select(CALL_SUMMARY_COLUMNS)
      .neq('phase', 'draft')
      .order('created_at', { ascending: false })
    if (error) dbError(error.message)
    return (data ?? []).map(toCallSummary)
  }

  async getBySlug(slug: string): Promise<{ call: Call; entries: CallEntry[] } | null> {
    const { data: call, error } = await this.supabase.from('calls').select(CALL_COLUMNS).eq('slug', slug).maybeSingle()
    if (error) dbError(error.message)
    if (!call) return null
    const { data: entries, error: entriesError } = await this.supabase
      .from('call_entries')
      .select(ENTRY_COLUMNS)
      .eq('call_id', call.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
    if (entriesError) dbError(entriesError.message)
    return { call: toCall(call), entries: (entries ?? []).map(toCallEntry) }
  }

  async listMyEntries(userId: string, callId: string): Promise<CallEntry[]> {
    const { data, error } = await this.supabase
      .from('call_entries')
      .select(ENTRY_COLUMNS)
      .eq('call_id', callId)
      .eq('author_id', userId)
      .order('created_at', { ascending: true })
    if (error) dbError(error.message)
    return (data ?? []).map(toCallEntry)
  }

  /** Published scripts of the author not entered in this call yet, with their cast to seed the entry. */
  async listEligibleScripts(userId: string, callId: string): Promise<EligibleScript[]> {
    const [{ data: scripts, error }, { data: entered }] = await Promise.all([
      this.supabase
        .from('scripts')
        .select('id, title, script_characters(name, description, apparent_age, gender, traits, sort_order)')
        .eq('author_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
      this.supabase.from('call_entries').select('script_id').eq('call_id', callId).eq('author_id', userId),
    ])
    if (error) dbError(error.message)
    const enteredIds = new Set((entered ?? []).map((row) => row.script_id))
    return (scripts ?? [])
      .filter((script) => !enteredIds.has(script.id))
      .map((script) => ({
        id: script.id,
        title: script.title,
        characters: [...(script.script_characters ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((c) => ({ name: c.name, description: c.description, apparentAge: c.apparent_age, gender: c.gender, traits: c.traits ?? [] })),
      }))
  }

  /** Enters a published script (pending review) with its characters to cast. */
  async enter(userId: string, input: { callId: string; scriptId: string; characters: CallCharacterInput[] }): Promise<{ entryId: string }> {
    const { data: entry, error } = await this.supabase
      .from('call_entries')
      .insert({ call_id: input.callId, script_id: input.scriptId, author_id: userId })
      .select('id')
      .single()
    if (error?.code === '23505') throw new TRPCError({ code: 'CONFLICT', message: 'Este roteiro já está inscrito neste edital.' })
    if (error?.code === '42501') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'As inscrições deste edital estão fechadas ou o roteiro não está publicado.' })
    }
    if (error) dbError(error.message)

    const { error: charactersError } = await this.supabase.from('call_characters').insert(toCharacterRows(entry.id, input.characters))
    if (charactersError) {
      await this.supabase.from('call_entries').delete().eq('id', entry.id)
      dbError(charactersError.message)
    }
    return { entryId: entry.id }
  }

  /** Replace-set of the entry's characters (RLS: own entry, submissions phase). */
  async updateCharacters(entryId: string, characters: CallCharacterInput[]): Promise<void> {
    const { error } = await this.supabase.from('call_characters').delete().eq('entry_id', entryId)
    if (error) dbError(error.message)
    const { error: insertError } = await this.supabase.from('call_characters').insert(toCharacterRows(entryId, characters))
    if (insertError?.code === '42501') throw new TRPCError({ code: 'FORBIDDEN', message: 'As inscrições deste edital estão fechadas.' })
    if (insertError) dbError(insertError.message)
  }

  async withdraw(userId: string, entryId: string): Promise<void> {
    const { data, error } = await this.supabase.from('call_entries').delete().eq('id', entryId).eq('author_id', userId).select('id')
    if (error) dbError(error.message)
    if (!data?.length) throw new TRPCError({ code: 'FORBIDDEN', message: 'Só é possível retirar inscrições pendentes com o edital aberto.' })
  }
}
