import { AGE_RATINGS, GENRES } from '@/lib/constants/scripts'
import { authenticatedProcedure, createTRPCRouter, publicProcedure } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export type ScriptListItem = {
  id: string
  title: string
  genre: string | null
  script_files: { page_count: number | null }[]
  author: { id: string; name: string | null } | null
}

type ScriptDetail = {
  id: string
  title: string
  logline: string | null
  synopsis: string | null
  genre: string | null
  age_rating: string | null
  is_featured: boolean
  published_at: string | null
  banner_path: string | null
  script_files: Array<{
    id: string
    storage_path: string
    page_count: number | null
    file_size: number | null
  }>
  audio_files: Array<{
    id: string
    storage_path: string
    duration_seconds: number | null
  }>
  author: { id: string; name: string | null; image: string | null } | null
}

export const scriptCreateSchema = z.object({
  title: z.string().min(1).max(200),
  logline: z.string().max(300).optional(),
  synopsis: z.string().max(2000).optional(),
  genre: z.enum(GENRES).optional(),
  ageRating: z.enum(AGE_RATINGS).optional(),
  storagePath: z.string().min(1),
  fileSize: z.number().int().positive().optional(),
  pageCount: z.number().int().positive().optional(),
  bannerPath: z.string().optional(),
  audioStoragePath: z.string().optional(),
  audioDurationSeconds: z.number().int().positive().optional(),
  // authorId is read from the session — never accepted from client input
})

export const scriptsRouter = createTRPCRouter({
  create: authenticatedProcedure.input(scriptCreateSchema).mutation(async ({ input, ctx }) => {
    const { storagePath, fileSize, pageCount, ageRating, bannerPath, audioStoragePath, audioDurationSeconds, ...scriptData } = input
    const authorId = ctx.user!.id

    // Ensure the author's profile exists in `users` to satisfy FK constraints.
    const authorEmail = ctx.user!.email ?? null
    const authorName = ctx.user!.user_metadata?.full_name ?? (authorEmail ? String(authorEmail).split('@')[0] : 'User')
    const { error: upsertError } = await ctx.supabase
      .from('users')
      .upsert({ id: authorId, name: String(authorName).slice(0, 100), email: authorEmail }, { onConflict: 'id' })

    if (upsertError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to ensure author profile: ${upsertError.message}`,
      })
    }

    // Insert script row
    const { data: script, error: scriptError } = await ctx.supabase
      .from('scripts')
      .insert({
        ...scriptData,
        age_rating: ageRating ?? null,
        banner_path: bannerPath ?? null,
        author_id: authorId,
        status: 'published',
        published_at: new Date().toISOString(),
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
    const { error: fileError } = await ctx.supabase.from('script_files').insert({
      script_id: script.id,
      storage_path: storagePath,
      file_size: fileSize ?? null,
      page_count: pageCount ?? null,
    })

    if (fileError) {
      // Best-effort rollback: delete the orphan script so it doesn't appear in
      // listings. This is NOT transactional — if the delete also fails the orphan
      // remains, but it will have status='published' with no associated file.
      // TODO: replace with a Postgres transaction / RPC once the POC graduates.
      await ctx.supabase.from('scripts').delete().eq('id', script.id)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: fileError.message,
      })
    }

    if (audioStoragePath) {
      await ctx.supabase.from('audio_files').insert({
        script_id: script.id,
        storage_path: audioStoragePath,
        duration_seconds: audioDurationSeconds ?? null,
      })
    }

    return script
  }),

  addAudioFile: authenticatedProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        storagePath: z.string().min(1),
        durationSeconds: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { data: script } = await ctx.supabase
        .from('scripts')
        .select('author_id')
        .eq('id', input.scriptId)
        .single()

      if (!script || script.author_id !== ctx.user!.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not the script author' })
      }

      const { error } = await ctx.supabase.from('audio_files').insert({
        script_id: input.scriptId,
        storage_path: input.storagePath,
        duration_seconds: input.durationSeconds ?? null,
      })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    }),

  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
    const { data: script } = await ctx.supabase
      .from('scripts')
      .select(
        'id, title, logline, synopsis, genre, age_rating, is_featured, published_at, banner_path,' +
          ' script_files(id, storage_path, page_count, file_size),' +
          ' audio_files(id, storage_path, duration_seconds),' +
          ' author:users!author_id(id, name, image)',
      )
      .eq('id', input.id)
      .maybeSingle()

    return (script ?? null) as ScriptDetail | null
  }),

  listRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { data: rows } = await ctx.supabase
        .from('scripts')
        .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(input.limit + 1)

      const items = (rows ?? []) as unknown as ScriptListItem[]
      const hasMore = items.length > input.limit
      return { items: items.slice(0, input.limit), hasMore }
    }),

  listFeatured: publicProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from('scripts')
      .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(6)

    return (data ?? []) as unknown as ScriptListItem[]
  }),

  listByAuthor: publicProcedure.input(z.object({ authorId: z.string().uuid() })).query(async ({ input, ctx }) => {
    const { data } = await ctx.supabase
      .from('scripts')
      .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
      .eq('author_id', input.authorId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    return (data ?? []) as unknown as ScriptListItem[]
  }),

  search: publicProcedure
    .input(
      z.object({
        // Reject PostgREST-special characters to prevent filter injection via .or()
        query: z
          .string()
          .max(100)
          .regex(/^[^%,().]+$/, 'Invalid search characters')
          .optional(),
        genres: z.array(z.enum(GENRES)).optional(),
        ageRatings: z.array(z.enum(AGE_RATINGS)).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      let queryBuilder = ctx.supabase
        .from('scripts')
        .select('id, title, genre, script_files(page_count), author:users!author_id(id, name)')
        .eq('status', 'published')

      if (input.query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${input.query}%,logline.ilike.%${input.query}%`)
      }

      if (input.genres && input.genres.length > 0) {
        queryBuilder = queryBuilder.in('genre', input.genres)
      }

      if (input.ageRatings && input.ageRatings.length > 0) {
        queryBuilder = queryBuilder.in('age_rating', input.ageRatings)
      }

      const { data } = await queryBuilder.limit(20)
      return (data ?? []) as unknown as ScriptListItem[]
    }),
})
