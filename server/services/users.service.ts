import { createClient } from '@supabase/supabase-js'
import { TRPCError } from '@trpc/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FollowUser, UserProfile, ProfileStats } from '@/lib/types'

export class UsersService {
  constructor(private supabase: SupabaseClient) {}

  async createProfile(id: string, name: string, email: string) {
    const { data: user, error } = await this.supabase
      .from('users')
      .insert({ id, name, email })
      .select()
      .single()

    if (error?.code === '23505') return null
    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return user ?? null
  }

  async getProfile(id: string): Promise<UserProfile | null> {
    const { data: user } = await this.supabase
      .from('users')
      .select('id, name, image, bio, cpf, created_at')
      .eq('id', id)
      .maybeSingle()
    if (!user) return null
    return {
      id: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
      cpf: user.cpf,
      createdAt: user.created_at,
    } as UserProfile
  }

  async updateProfile(
    id: string,
    updates: { name?: string; bio?: string | null; image?: string; cpf?: string | null },
  ) {
    const { data: updated, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Unique violation on the cpf constraint — surface a friendly message.
      if (error.code === '23505') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'CPF já cadastrado.' })
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    if (!updated) return null
    return {
      id: updated.id,
      name: updated.name,
      image: updated.image,
      bio: updated.bio,
      cpf: updated.cpf,
      createdAt: updated.created_at,
    } as UserProfile
  }

  async isFollowing(followerId: string, followeeId: string) {
    const { data: row } = await this.supabase
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('followee_id', followeeId)
      .maybeSingle()
    return { following: !!row }
  }

  async follow(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot follow yourself' })
    }
    const { error } = await this.supabase
      .from('user_follows')
      .upsert({ follower_id: followerId, followee_id: followeeId }, { onConflict: 'follower_id,followee_id' })
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return { following: true }
  }

  async unfollow(followerId: string, followeeId: string) {
    const { error } = await this.supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('followee_id', followeeId)
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return { following: false }
  }

  async getProfileStats(userId: string): Promise<ProfileStats> {
    const { data, error } = await this.supabase.rpc('get_profile_stats', { p_user_id: userId })

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    const stats = data as {
      scriptsCount: number
      averageRating: number
      followersCount: number
      followingCount: number
    }

    return {
      followers: stats.followersCount,
      following: stats.followingCount,
      scripts: stats.scriptsCount,
      avgRating: stats.averageRating === 0 ? null : stats.averageRating,
    }
  }

  /** Users who follow `userId`. */
  async listFollowers(userId: string): Promise<FollowUser[]> {
    const { data, error } = await this.supabase
      .from('user_follows')
      .select('created_at, follower:users!follower_id(id, name, image, bio)')
      .eq('followee_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

    return (data ?? [])
      .map((row) => {
        const r = row as Record<string, unknown> & { follower?: unknown }
        return Array.isArray(r.follower) ? r.follower[0] : r.follower
      })
      .filter(Boolean) as FollowUser[]
  }

  async deactivateAccount(userId: string) {
    const { error } = await this.supabase
      .from('users')
      .update({ deactivated_at: new Date().toISOString() })
      .eq('id', userId)
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return { success: true }
  }

  async deleteAccount(userId: string) {
    // 1. Fetch all scripts with their storage file paths
    const { data: scripts } = await this.supabase
      .from('scripts')
      .select('cover_path, banner_path, script_files(storage_path), audio_files(storage_path)')
      .eq('author_id', userId)

    // 2. Delete storage files for each script (non-critical — never throw)
    for (const script of scripts ?? []) {
      const pdfPaths = (script.script_files ?? []).map((f) => f.storage_path).filter(Boolean) as string[]
      if (pdfPaths.length) await this.supabase.storage.from('scripts').remove(pdfPaths).catch(() => {})

      const audioPaths = (script.audio_files ?? []).map((f) => f.storage_path).filter(Boolean) as string[]
      if (audioPaths.length) await this.supabase.storage.from('audio').remove(audioPaths).catch(() => {})

      if (script.cover_path) await this.supabase.storage.from('avatars').remove([script.cover_path]).catch(() => {})
      if (script.banner_path) await this.supabase.storage.from('avatars').remove([script.banner_path]).catch(() => {})
    }

    // 3. Delete user avatar files from avatars/{userId}/ folder
    const { data: avatarFiles } = await this.supabase.storage.from('avatars').list(userId)
    if (avatarFiles?.length) {
      const paths = avatarFiles.map((f) => `${userId}/${f.name}`)
      await this.supabase.storage.from('avatars').remove(paths).catch(() => {})
    }

    // 4. Delete user row — cascades scripts, comments, ratings, follows, reactions
    const { error: deleteError } = await this.supabase.from('users').delete().eq('id', userId)
    if (deleteError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message })

    // 5. Delete Supabase Auth user (requires service role key)
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
    const { error: authError } = await admin.auth.admin.deleteUser(userId)
    if (authError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: authError.message })

    return { success: true }
  }

  /** Users that `userId` follows. */
  async listFollowing(userId: string): Promise<FollowUser[]> {
    const { data, error } = await this.supabase
      .from('user_follows')
      .select('created_at, followee:users!followee_id(id, name, image, bio)')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

    return (data ?? [])
      .map((row) => {
        const r = row as Record<string, unknown> & { followee?: unknown }
        return Array.isArray(r.followee) ? r.followee[0] : r.followee
      })
      .filter(Boolean) as FollowUser[]
  }
}
