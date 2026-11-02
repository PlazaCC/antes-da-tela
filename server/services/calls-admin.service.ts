import type { CallPhase } from '@/lib/constants/calls'
import type { Call, CallEntry } from '@/lib/types/calls'
import type { CallUpsertInput } from '@/lib/validators/calls'
import { CALL_COLUMNS, dbError, ENTRY_COLUMNS, toCall, toCallEntry } from '@/server/services/calls.mappers'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'

export type AdminCall = Call & { pendingEntries: number; approvedEntries: number }
export type AdminCallEntry = CallEntry & { authorId: string }

const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null)

/** Staff management of calls and entries (A2/A3). RLS: admins only. */
export class CallsAdminService {
  constructor(private supabase: SupabaseClient) {}

  async listCalls(): Promise<AdminCall[]> {
    const { data, error } = await this.supabase
      .from('calls')
      .select(`${CALL_COLUMNS}, entries:call_entries(status)`)
      .order('created_at', { ascending: false })
    if (error) dbError(error.message)
    return (data ?? []).map((row) => {
      const statuses = ((row.entries ?? []) as Array<{ status: string }>).map((e) => e.status)
      return {
        ...toCall(row),
        pendingEntries: statuses.filter((s) => s === 'pending').length,
        approvedEntries: statuses.filter((s) => s === 'approved').length,
      }
    })
  }

  async getCall(id: string): Promise<Call | null> {
    const { data, error } = await this.supabase.from('calls').select(CALL_COLUMNS).eq('id', id).maybeSingle()
    if (error) dbError(error.message)
    return data ? toCall(data) : null
  }

  async upsertCall(adminId: string, input: CallUpsertInput): Promise<{ id: string }> {
    const row = {
      slug: input.slug,
      title: input.title,
      description: input.description || null,
      partner: input.partner || null,
      rules: input.rules || null,
      submissions_end_at: iso(input.submissionsEndAt),
      casting_end_at: iso(input.castingEndAt),
      voting_start_at: iso(input.votingStartAt),
      voting_end_at: iso(input.votingEndAt),
      updated_at: new Date().toISOString(),
    }
    const query = input.id
      ? this.supabase.from('calls').update(row).eq('id', input.id)
      : this.supabase.from('calls').insert({ ...row, created_by: adminId })
    const { data, error } = await query.select('id').single()
    if (error?.code === '23505') throw new TRPCError({ code: 'CONFLICT', message: 'Já existe um edital com este endereço (slug).' })
    if (error) dbError(error.message)
    return { id: data.id }
  }

  async setPhase(callId: string, phase: CallPhase): Promise<void> {
    const { error } = await this.supabase.from('calls').update({ phase, updated_at: new Date().toISOString() }).eq('id', callId)
    if (error) dbError(error.message)
  }

  async listEntries(callId: string): Promise<AdminCallEntry[]> {
    const { data, error } = await this.supabase
      .from('call_entries')
      .select(`${ENTRY_COLUMNS}, author_id`)
      .eq('call_id', callId)
      .order('created_at', { ascending: true })
    if (error) dbError(error.message)
    return (data ?? []).map((row) => ({ ...toCallEntry(row), authorId: row.author_id }))
  }

  async reviewEntry(input: { entryId: string; decision: 'approved' | 'rejected'; reason?: string }): Promise<void> {
    const { error } = await this.supabase
      .from('call_entries')
      .update({ status: input.decision, review_reason: input.decision === 'rejected' ? input.reason : null })
      .eq('id', input.entryId)
    if (error) dbError(error.message)
  }
}
