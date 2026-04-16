import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

// ── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    image: text('image'),
    bio: text('bio'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  () => [
    pgPolicy('Users can view and update their own data', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`auth.uid() = id`,
      withCheck: sql`auth.uid() = id`,
    }),
    pgPolicy('Users are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`true`,
    }),
  ],
)

// ── Enums ─────────────────────────────────────────────────────────────────────

export const scriptStatusEnum = pgEnum('script_status', ['draft', 'published'])

// ── Scripts ───────────────────────────────────────────────────────────────────

export const scripts = pgTable(
  'scripts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    logline: text('logline'),
    synopsis: text('synopsis'),
    genre: text('genre'),
    ageRating: text('age_rating'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    status: scriptStatusEnum('status').default('published').notNull(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bannerPath: text('banner_path'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    publishedAt: timestamp('published_at'),
  },
  () => [
    pgPolicy('Published scripts are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`status = 'published'`,
    }),
    pgPolicy('Authors manage their own scripts', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`auth.uid() = author_id`,
      withCheck: sql`auth.uid() = author_id`,
    }),
  ],
)

// ── Script Files (PDF) ────────────────────────────────────────────────────────

export const scriptFiles = pgTable(
  'script_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scriptId: uuid('script_id')
      .notNull()
      .references(() => scripts.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    fileSize: integer('file_size'), // bytes
    pageCount: integer('page_count'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  () => [
    pgPolicy('Script files follow script visibility', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`true`,
    }),
    pgPolicy('Authors manage their script files', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`auth.uid() = (select author_id from scripts where id = script_id)`,
      withCheck: sql`auth.uid() = (select author_id from scripts where id = script_id)`,
    }),
  ],
)

// ── Audio Files ───────────────────────────────────────────────────────────────

export const audioFiles = pgTable(
  'audio_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scriptId: uuid('script_id')
      .notNull()
      .references(() => scripts.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    durationSeconds: integer('duration_seconds'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  () => [
    pgPolicy('Audio files are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`true`,
    }),
    pgPolicy('Authors manage their audio files', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`auth.uid() = (select author_id from scripts where id = script_id)`,
      withCheck: sql`auth.uid() = (select author_id from scripts where id = script_id)`,
    }),
  ],
)

// ── Comments ──────────────────────────────────────────────────────────────────

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scriptId: uuid('script_id')
      .notNull()
      .references(() => scripts.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    pageNumber: integer('page_number').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
    deletedAt: timestamp('deleted_at'), // soft delete
  },
  () => [
    pgPolicy('Comments on published scripts are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`deleted_at is null`,
    }),
    pgPolicy('Authenticated users can create comments', {
      as: 'permissive',
      to: 'authenticated',
      for: 'insert',
      withCheck: sql`auth.uid() = author_id`,
    }),
    pgPolicy('Authors manage their own comments', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`auth.uid() = author_id`,
      withCheck: sql`auth.uid() = author_id`,
    }),
  ],
)

// ── Ratings ───────────────────────────────────────────────────────────────────

export const ratings = pgTable(
  'ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scriptId: uuid('script_id')
      .notNull()
      .references(() => scripts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    score: smallint('score').notNull(), // 1–5
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('ratings_script_user_unique').on(table.scriptId, table.userId),
    check('ratings_score_range', sql`${table.score} >= 1 AND ${table.score} <= 5`),
    pgPolicy('Ratings are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`true`,
    }),
    pgPolicy('Authenticated users manage their own ratings', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`auth.uid() = user_id`,
      withCheck: sql`auth.uid() = user_id`,
    }),
  ],
)

// ── Relations ─────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  scripts: many(scripts),
  comments: many(comments),
  ratings: many(ratings),
}))

export const scriptsRelations = relations(scripts, ({ one, many }) => ({
  author: one(users, { fields: [scripts.authorId], references: [users.id] }),
  scriptFiles: many(scriptFiles),
  audioFiles: many(audioFiles),
  comments: many(comments),
  ratings: many(ratings),
}))

export const scriptFilesRelations = relations(scriptFiles, ({ one }) => ({
  script: one(scripts, { fields: [scriptFiles.scriptId], references: [scripts.id] }),
}))

export const audioFilesRelations = relations(audioFiles, ({ one }) => ({
  script: one(scripts, { fields: [audioFiles.scriptId], references: [scripts.id] }),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  script: one(scripts, { fields: [comments.scriptId], references: [scripts.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}))

export const ratingsRelations = relations(ratings, ({ one }) => ({
  script: one(scripts, { fields: [ratings.scriptId], references: [scripts.id] }),
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
}))

// ── Inferred types (use in tRPC routers) ─────────────────────────────────────

export type User = typeof users.$inferSelect
export type Script = typeof scripts.$inferSelect
export type ScriptFile = typeof scriptFiles.$inferSelect
export type AudioFile = typeof audioFiles.$inferSelect
export type Comment = typeof comments.$inferSelect
export type Rating = typeof ratings.$inferSelect

export type NewScript = typeof scripts.$inferInsert
export type NewComment = typeof comments.$inferInsert
export type NewRating = typeof ratings.$inferInsert
