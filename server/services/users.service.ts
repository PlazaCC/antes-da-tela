import { removeAssets, removeS3Prefix } from '@/lib/storage/remove'
import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { FollowUser, UserProfile, ProfileStats } from '@/lib/types'

export class UsersService {
  constructor(private supabase: SupabaseClient) {}

  async getProfile(id: string): Promise<UserProfile | null> {
    const { data: user } = await this.supabase
      .from('users')
      .select('id, name, image, bio, created_at')
      .eq('id', id)
      .maybeSingle()
    if (!user) return null
    return {
      id: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
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
      .select('id, name, image, bio, created_at')
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
      createdAt: updated.created_at,
    } as UserProfile
  }

  /**
   * The caller's own CPF. `cpf` is not selectable on `users` (column privilege,
   * see drizzle/0014_protect_user_pii.sql), so it is read through an RPC that
   * only ever returns the row of `auth.uid()`.
   */
  async getMyCpf(): Promise<string | null> {
    const { data, error } = await this.supabase.rpc('get_my_cpf')
    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return (data as string | null) ?? null
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

  async deleteAccount(userId: string, clerkId: string) {
    // 1. Fetch all scripts with their storage file paths
    const { data: scripts } = await this.supabase
      .from('scripts')
      .select('cover_path, banner_path, pitch_deck_path, script_files(storage_path), audio_files(storage_path)')
      .eq('author_id', userId)

    // 2. Delete stored files (S3 or legacy Supabase Storage; never throws)
    for (const script of scripts ?? []) {
      const pdfPaths = (script.script_files ?? []).map((f) => f.storage_path).filter(Boolean) as string[]
      const audioPaths = (script.audio_files ?? []).map((f) => f.storage_path).filter(Boolean) as string[]
      const imagePaths = [script.cover_path, script.banner_path].filter(Boolean) as string[]
      await Promise.all([
        removeAssets(this.supabase, 'scripts', [...pdfPaths, ...(script.pitch_deck_path ? [script.pitch_deck_path] : [])]),
        removeAssets(this.supabase, 'audio', audioPaths),
        removeAssets(this.supabase, 'avatars', imagePaths),
      ])
    }

    // 3. Delete avatar files: S3 avatars/{userId}/ and legacy avatars bucket {userId}/
    await removeS3Prefix(`avatars/${userId}/`)
    const { data: avatarFiles } = await this.supabase.storage.from('avatars').list(userId)
    if (avatarFiles?.length) {
      await removeAssets(this.supabase, 'avatars', avatarFiles.map((f) => `${userId}/${f.name}`))
    }

    // 4. Delete user row — cascades scripts, comments, ratings, follows, reactions
    const { error: deleteError } = await this.supabase.from('users').delete().eq('id', userId)
    if (deleteError) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: deleteError.message })

    // 5. Delete the Clerk user (ends every session)
    const clerk = await clerkClient()
    await clerk.users.deleteUser(clerkId)

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
