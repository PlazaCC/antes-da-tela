import type { InterpreterModality } from '@/lib/constants/interpreters'
import type { InterpreterBadge, InterpreterForReview, InterpreterProfile, ReviewStatus } from '@/lib/types/interpreters'
import { getPrivateAssetUrl } from '@/lib/storage/private-url'
import type { interpreterReviewSchema, interpreterSubmissionSchema } from '@/lib/validators/interpreter'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'
import type { z } from 'zod'

const COLUMNS =
  'user_id, modalities, status, media_path, media_type, duration_seconds, birth_date, experience, age_range, languages, drt, rejection_reason, updated_at'

type Row = {
  user_id: string
  modalities: InterpreterModality[]
  status: ReviewStatus
  media_path: string
  media_type: 'video' | 'audio'
  duration_seconds: number
  birth_date: string
  experience: string | null
  age_range: string | null
  languages: string | null
  drt: string | null
  rejection_reason: string | null
  updated_at: string
}

async function toProfile(row: Row): Promise<InterpreterProfile> {
  return {
    userId: row.user_id,
    modalities: row.modalities,
    status: row.status,
    mediaPath: row.media_path,
    mediaType: row.media_type,
    mediaUrl: await getPrivateAssetUrl(row.media_path),
    durationSeconds: row.duration_seconds,
    birthDate: row.birth_date,
    experience: row.experience,
    ageRange: row.age_range,
    languages: row.languages,
    drt: row.drt,
    rejectionReason: row.rejection_reason,
    updatedAt: row.updated_at,
  }
}

function fail(message: string): never {
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message })
}

/**
 * Interpreter registration and review (RFC-006 phase 2). RLS lets owners read
 * and resubmit their own row and admins read/review every row.
 */
export class InterpretersService {
  constructor(private supabase: SupabaseClient) {}

  async getMine(userId: string): Promise<InterpreterProfile | null> {
    const { data, error } = await this.supabase.from('interpreter_profiles').select(COLUMNS).eq('user_id', userId).maybeSingle()
    if (error) fail(error.message)
    return data ? toProfile(data as Row) : null
  }

  /** Insert or resubmit: always back to review, previous decision cleared. */
  async submit(userId: string, input: z.output<typeof interpreterSubmissionSchema>): Promise<InterpreterProfile> {
    if (!input.mediaPath.startsWith(`interpreters/${userId}/`)) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Arquivo de mídia inválido.' })
    }
    const now = new Date().toISOString()
    const { error } = await this.supabase.from('interpreter_profiles').upsert(
      {
        user_id: userId,
        modalities: input.modalities,
        status: 'pending',
        media_path: input.mediaPath,
        media_type: input.mediaType,
        duration_seconds: input.durationSeconds,
        birth_date: input.birthDate,
        experience: input.experience || null,
        age_range: input.ageRange || null,
        languages: input.languages || null,
        drt: input.drt || null,
        consent_at: now,
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    )
    if (error) fail(error.message)
    return (await this.getMine(userId))!
  }

  /** Public: approved interpreters only (SECURITY DEFINER RPC hides everything else). */
  async getBadge(userId: string): Promise<InterpreterBadge | null> {
    const { data, error } = await this.supabase.rpc('get_interpreter_badge', { p_user_id: userId })
    if (error) fail(error.message)
    const row = (data as Array<{ modalities: InterpreterModality[]; media_path: string; media_type: 'video' | 'audio' }>)?.[0]
    if (!row) return null
    return { modalities: row.modalities, mediaType: row.media_type, mediaUrl: await getPrivateAssetUrl(row.media_path) }
  }

  /** Admin queue (RLS: admins read every row). Oldest first, so nobody waits forever. */
  async listForReview(status: ReviewStatus): Promise<InterpreterForReview[]> {
    const { data, error } = await this.supabase
      .from('interpreter_profiles')
      .select(`${COLUMNS}, user:users!interpreter_profiles_user_id_users_id_fk(name, display_name, image)`)
      .eq('status', status)
      .order('updated_at', { ascending: true })
      .limit(100)
    if (error) fail(error.message)
    return Promise.all(
      (data ?? []).map(async (row) => {
        const user = (Array.isArray(row.user) ? row.user[0] : row.user) as { name: string; display_name: string | null; image: string | null }
        return { ...(await toProfile(row as unknown as Row)), name: user.name, displayName: user.display_name, image: user.image }
      }),
    )
  }

  async review(adminId: string, input: z.output<typeof interpreterReviewSchema>): Promise<{ userId: string; status: ReviewStatus }> {
    const { data, error } = await this.supabase
      .from('interpreter_profiles')
      .update({
        status: input.decision,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: input.decision === 'rejected' ? input.reason : null,
      })
      .eq('user_id', input.userId)
      .select('user_id')
      .maybeSingle()
    if (error) fail(error.message)
    if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Cadastro de intérprete não encontrado.' })
    return { userId: input.userId, status: input.decision }
  }
}
