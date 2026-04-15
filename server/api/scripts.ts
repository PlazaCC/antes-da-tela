import { db } from '@/server/db'
import { scriptFiles, scripts } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { ilike, or } from 'drizzle-orm'
import { z } from 'zod'

const GENRES = [
  'drama',
  'thriller',
  'comédia',
  'ficção científica',
  'terror',
  'romance',
  'documentário',
  'animação',
  'outro',
] as const

const AGE_RATINGS = ['livre', '10', '12', '14', '16', '18'] as const

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
  authorId: z.string().uuid(),
})

export const scriptsRouter = createTRPCRouter({
  create: publicProcedure
    .input(scriptCreateSchema)
    .mutation(async ({ input }) => {
      const { storagePath, fileSize, pageCount, authorId, ...scriptData } = input

      const [script] = await db
        .insert(scripts)
        .values({ ...scriptData, authorId, publishedAt: new Date() })
        .returning()

      await db.insert(scriptFiles).values({
        scriptId: script.id,
        storagePath,
        fileSize,
        pageCount,
      })

      return script
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const script = await db.query.scripts.findFirst({
        where: (s, { eq }) => eq(s.id, input.id),
        with: {
          scriptFiles: true,
          author: { columns: { id: true, name: true, image: true } },
        },
      })
      return script ?? null
    }),

  listRecent: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(12),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ input }) => {
      const rows = await db.query.scripts.findMany({
        where: (s, { eq }) => eq(s.status, 'published'),
        orderBy: (s, { desc }) => [desc(s.publishedAt)],
        limit: input.limit + 1,
        with: { author: { columns: { id: true, name: true } } },
      })
      const hasMore = rows.length > input.limit
      return { items: rows.slice(0, input.limit), hasMore }
    }),

  listFeatured: publicProcedure.query(async () => {
    return db.query.scripts.findMany({
      where: (s, { eq, and }) => and(eq(s.status, 'published'), eq(s.isFeatured, true)),
      orderBy: (s, { desc }) => [desc(s.publishedAt)],
      limit: 6,
      with: { author: { columns: { id: true, name: true } } },
    })
  }),

  listByAuthor: publicProcedure
    .input(z.object({ authorId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.query.scripts.findMany({
        where: (s, { eq, and }) =>
          and(eq(s.authorId, input.authorId), eq(s.status, 'published')),
        orderBy: (s, { desc }) => [desc(s.publishedAt)],
        with: { author: { columns: { id: true, name: true } } },
      })
    }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        genre: z.enum(GENRES).optional(),
      }),
    )
    .query(async ({ input }) => {
      return db.query.scripts.findMany({
        where: (s, { eq, and }) =>
          and(
            eq(s.status, 'published'),
            or(ilike(s.title, `%${input.query}%`)),
            input.genre ? eq(s.genre, input.genre) : undefined,
          ),
        limit: 20,
        with: { author: { columns: { id: true, name: true } } },
      })
    }),
})
