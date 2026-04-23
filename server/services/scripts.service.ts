import { TRPCError } from '@trpc/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getScriptPublishDefaults } from '@/server/domain/scripts'
import type { ScriptCreateInput, ScriptUpdateInput } from '@/lib/validators/scripts'
import type { ScriptListItem, ScriptDetail, DashboardMetrics } from '@/lib/types'

export class ScriptsService {
  constructor(private supabase: SupabaseClient) {}

  async create(
    input: ScriptCreateInput,
    userId: string,
    userMetadata: Record<string, unknown> | null,
    userEmail: string | null,
  ) {
    const { storagePath, fileSize, pageCount, ageRating, bannerPath, audioStoragePath, audioDurationSeconds, ...scriptData } = input

    // Ensure the author's profile exists
    const authorName = userMetadata?.full_name ?? (userEmail ? String(userEmail).split('@')[0] : 'User')
    const { error: upsertError } = await this.supabase
      .from('users')
      .upsert({ id: userId, name: String(authorName).slice(0, 100), email: userEmail }, { onConflict: 'id' })

    if (upsertError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to ensure author profile: ${upsertError.message}`,
      })
    }

    // Insert script row
    const { data: script, error: scriptError } = await this.supabase
      .from('scripts')
      .insert({
        ...scriptData,
        age_rating: ageRating ?? null,
        banner_path: bannerPath ?? null,
        author_id: userId,
        ...getScriptPublishDefaults(),
      })
      .select('id, title')
      .single()

    if (scriptError || !script) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: scriptError?.message ?? 'Failed to create script',
      })
    }

    // Insert associated script file
    const { error: fileError } = await this.supabase.from('script_files').insert({
      script_id: script.id,
      storage_path: storagePath,
      file_size: fileSize ?? null,
      page_count: pageCount ?? null,
    })

    if (fileError) {
      await this.supabase.from('scripts').delete().eq('id', script.id)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: fileError.message,
      })
    }

    if (audioStoragePath) {
      await this.supabase.from('audio_files').insert({
        script_id: script.id,
        storage_path: audioStoragePath,
        duration_seconds: audioDurationSeconds ?? null,
      })
    }

    return script
  }

  async addAudioFile(scriptId: string, storagePath: string, userId: string, durationSeconds?: number) {
    const { data: script } = await this.supabase
      .from('scripts')
      .select('author_id')
      .eq('id', scriptId)
      .single()

    if (!script || script.author_id !== userId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not the script author' })
    }

    const { error } = await this.supabase.from('audio_files').insert({
      script_id: scriptId,
      storage_path: storagePath,
      duration_seconds: durationSeconds ?? null,
    })

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
  }

  async update(input: ScriptUpdateInput & { authorId: string }) {
    const { id, authorId, storagePath, fileSize, pageCount, audioStoragePath, audioDurationSeconds, ...updateData } = input

    // Check ownership
    const { data: script } = await this.supabase
      .from('scripts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!script || script.author_id !== authorId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not the script author' })
    }

    // Map camelCase to snake_case for Supabase
    const mappedData: any = {}
    if (updateData.title) mappedData.title = updateData.title
    if (updateData.logline) mappedData.logline = updateData.logline
    if (updateData.synopsis) mappedData.synopsis = updateData.synopsis
    if (updateData.genre) mappedData.genre = updateData.genre
    if (updateData.ageRating) mappedData.age_rating = updateData.ageRating
    if (updateData.status) mappedData.status = updateData.status
    if (updateData.bannerPath) mappedData.banner_path = updateData.bannerPath

    const { error: updateError } = await this.supabase
      .from('scripts')
      .update(mappedData)
      .eq('id', id)

    if (updateError) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
    }

    // Check if new files are being uploaded to delete the old ones from storage
    if (storagePath || audioStoragePath) {
      const { data: oldFiles } = await this.supabase
        .from('scripts')
        .select('script_files(storage_path), audio_files(storage_path)')
        .eq('id', id)
        .single()

      if (storagePath && oldFiles?.script_files?.[0]?.storage_path && storagePath !== oldFiles.script_files[0].storage_path) {
        // New PDF provided, delete old one
        await this.supabase.storage.from('scripts').remove([oldFiles.script_files[0].storage_path])
      }

      if (audioStoragePath && oldFiles?.audio_files?.[0]?.storage_path && audioStoragePath !== oldFiles.audio_files[0].storage_path) {
        // New Audio provided, delete old one
        await this.supabase.storage.from('audio').remove([oldFiles.audio_files[0].storage_path])
      }
    }

    // Update file if provided
    if (storagePath) {
      const { error: fileError } = await this.supabase
        .from('script_files')
        .upsert({
          script_id: id,
          storage_path: storagePath,
          file_size: fileSize ?? null,
          page_count: pageCount ?? null,
        }, { onConflict: 'script_id' })

      if (fileError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: fileError.message })
      }
    }

    if (audioStoragePath) {
      const { error: audioError } = await this.supabase
        .from('audio_files')
        .upsert({
          script_id: id,
          storage_path: audioStoragePath,
          duration_seconds: audioDurationSeconds ?? null,
        }, { onConflict: 'script_id' })

      if (audioError) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: audioError.message })
      }
    }

    return { id }
  }

  async delete(id: string, authorId: string) {
    // Check ownership
    const { data: script } = await this.supabase
      .from('scripts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!script || script.author_id !== authorId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Not the script author' })
    }

    // Get associated files to delete them from storage buckets
    const { data: filesToDelete } = await this.supabase
      .from('scripts')
      .select('script_files(storage_path), audio_files(storage_path)')
      .eq('id', id)
      .single()

    if (filesToDelete) {
      const pdfPaths = filesToDelete.script_files?.map(f => f.storage_path).filter(Boolean) || []
      if (pdfPaths.length > 0) {
        await this.supabase.storage.from('scripts').remove(pdfPaths)
      }

      const audioPaths = filesToDelete.audio_files?.map(f => f.storage_path).filter(Boolean) || []
      if (audioPaths.length > 0) {
        await this.supabase.storage.from('audio').remove(audioPaths)
      }
    }

    // Now delete the database record (cascade will handle child tables)
    const { error } = await this.supabase.from('scripts').delete().eq('id', id)

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    return { success: true }
  }

  async getById(id: string) {
    const { data: script } = await this.supabase
      .from('scripts')
      .select(
        'id, title, logline, synopsis, genre, age_rating, is_featured, published_at, banner_path,' +
          ' script_files(id, storage_path, page_count, file_size),' +
          ' audio_files(id, storage_path, duration_seconds),' +
          ' author:users!author_id(id, name, image, bio)',
      )
      .eq('id', id)
      .maybeSingle()

    if (!script) return null
    const scriptData = script as unknown as Record<string, unknown> & { author?: unknown }
    return {
      ...scriptData,
      author: Array.isArray(scriptData.author) ? scriptData.author[0] : (scriptData.author ?? null),
    } as ScriptDetail
  }

  async listRecent(limit: number) {
    const { data: rows } = await this.supabase
      .from('scripts')
      .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit + 1)

    const items = (rows ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown }
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      }
    }) as ScriptListItem[]
    const hasMore = items.length > limit
    return { items: items.slice(0, limit), hasMore }
  }
  async listFeatured(): Promise<ScriptListItem[]> {
    const { data } = await this.supabase
      .from('scripts')
      .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(6)

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown }
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      }
    }) as ScriptListItem[]
  }

  async listByAuthor(authorId: string): Promise<ScriptListItem[]> {
    const { data } = await this.supabase
      .from('scripts')
      .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
      .eq('author_id', authorId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown }
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      }
    }) as ScriptListItem[]
  }

  async getDashboardMetrics(authorId: string): Promise<DashboardMetrics> {
    const { data, error } = await this.supabase.rpc('get_author_dashboard_metrics', {
      p_author_id: authorId,
    })

    if (error) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }

    return data as DashboardMetrics
  }

  async search(query?: string, genres?: string[], ageRatings?: string[]): Promise<ScriptListItem[]> {
    let queryBuilder = this.supabase
      .from('scripts')
      .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
      .eq('status', 'published')

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,logline.ilike.%${query}%`)
    }

    if (genres && genres.length > 0) {
      queryBuilder = queryBuilder.in('genre', genres)
    }

    if (ageRatings && ageRatings.length > 0) {
      queryBuilder = queryBuilder.in('age_rating', ageRatings)
    }

    const { data } = await queryBuilder.limit(20)
    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown }
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      }
    }) as ScriptListItem[]
  }
}
