import { TRPCError } from '@trpc/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserProfile, ProfileStats } from '@/lib/types'

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

  async updateProfile(id: string, updates: { name?: string; bio?: string | null; image?: string }) {
    const { data: updated, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
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
}
