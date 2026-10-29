import type { UserIntent } from '@/lib/constants/preferences'
import type { Preferences } from '@/lib/validators/onboarding'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'

export type OnboardingState = {
  intents: UserIntent[]
  gender: string | null
  completedAt: string | null
}

const EMPTY_PREFERENCES: Preferences = { genres: [], formats: [], themes: [], goals: [] }

/**
 * Onboarding state and content preferences (RFC-006). Both tables are
 * owner-only (RLS), so every query is scoped to the caller's `users.id`.
 */
export class OnboardingService {
  constructor(private supabase: SupabaseClient) {}

  async getState(userId: string): Promise<OnboardingState> {
    const { data, error } = await this.supabase
      .from('user_onboarding')
      .select('intents, gender, completed_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return {
      intents: (data?.intents ?? []) as UserIntent[],
      gender: data?.gender ?? null,
      completedAt: data?.completed_at ?? null,
    }
  }

  /** Upserts the caller's row; only the given fields change. */
  async update(
    userId: string,
    fields: { intents?: UserIntent[]; gender?: string | null; completedAt?: string },
  ): Promise<OnboardingState> {
    const row = {
      user_id: userId,
      ...(fields.intents ? { intents: fields.intents } : {}),
      ...(fields.gender !== undefined ? { gender: fields.gender } : {}),
      ...(fields.completedAt ? { completed_at: fields.completedAt } : {}),
      updated_at: new Date().toISOString(),
    }
    const { error } = await this.supabase.from('user_onboarding').upsert(row, { onConflict: 'user_id' })
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return this.getState(userId)
  }

  async getPreferences(userId: string): Promise<Preferences> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('genres, formats, themes, goals')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data ?? EMPTY_PREFERENCES
  }

  async upsertPreferences(userId: string, preferences: Preferences): Promise<Preferences> {
    const { error } = await this.supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...preferences, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return preferences
  }
}
