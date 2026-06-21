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
