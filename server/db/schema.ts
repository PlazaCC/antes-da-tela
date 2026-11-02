import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

// ── Users ────────────────────────────────────────────────────────────────────
// SELECT on `users` is granted per column to anon/authenticated (everything
// except `cpf`, see drizzle/0014_protect_user_pii.sql). A new column is NOT
// readable by the app until a migration grants SELECT on it explicitly.

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    image: text('image'),
    bio: text('bio'),
    // Public profile fields collected in onboarding (RFC-006). How the user
    // wants to be called, shown instead of `name` when set.
    displayName: text('display_name'),
    pronouns: text('pronouns'),
    location: text('location'),
    // { instagram?, website?, portfolio? } — see lib/validators/profile.ts.
    links: jsonb('links').$type<{ instagram?: string; website?: string; portfolio?: string }>(),
    // Deprecated: replaced by user_documents (RFC-005 §3). Kept until the
    // contract migration drops it; the app no longer reads or writes it.
    cpf: text('cpf').unique(),
    // Clerk user id (`user_...`). Null for accounts not yet linked to Clerk;
    // public.current_user_id() maps the Clerk JWT `sub` to `users.id` through it.
    clerkId: text('clerk_id').unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deactivatedAt: timestamp('deactivated_at'),
  },
  () => [
    pgPolicy('Users can view and update their own data', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = id`,
      withCheck: sql`(select public.current_user_id()) = id`,
    }),
    pgPolicy('Users are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`true`,
    }),
  ],
)

// ── User Documents ───────────────────────────────────────────────────────────
// Identity document required to publish (RFC-005 §3). Kept out of `users`,
// which is publicly readable: only the owner can read or write their row, and
// the app only ever returns it masked. One document per user.

export const documentTypeEnum = pgEnum('document_type', ['cpf', 'passport', 'crnm', 'foreign_national_id'])

export const userDocuments = pgTable(
  'user_documents',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: documentTypeEnum('type').notNull(),
    // Normalized: digits only (cpf) or uppercase alphanumerics without separators.
    number: text('number').notNull(),
    // ISO 3166-1 alpha-2; 'BR' for cpf and crnm.
    country: text('country').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_documents_type_country_number_unique').on(table.type, table.country, table.number),
    pgPolicy('Owners manage their own document', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = user_id`,
      withCheck: sql`(select public.current_user_id()) = user_id`,
    }),
  ],
)

// ── Onboarding (RFC-006) ─────────────────────────────────────────────────────
// Private per-user data: what the user came to do (intents), private profile
// fields and whether the first-login onboarding is done. Owner-only, like
// user_documents — `users` is publicly readable.

export const userIntentEnum = pgEnum('user_intent', ['reader', 'producer', 'interpreter'])

export const userOnboarding = pgTable(
  'user_onboarding',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    intents: userIntentEnum('intents').array().default(sql`'{}'::user_intent[]`).notNull(),
    // Private: never part of the public profile.
    gender: text('gender'),
    // Null until the user finishes (or skips through) the onboarding.
    completedAt: timestamp('completed_at'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  () => [
    pgPolicy('Owners manage their own onboarding', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = user_id`,
      withCheck: sql`(select public.current_user_id()) = user_id`,
    }),
  ],
)

// Content preferences (onboarding survey, editable in /profile/preferences).
// Values come from lib/constants/preferences.ts.
export const userPreferences = pgTable(
  'user_preferences',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    genres: text('genres').array().default(sql`'{}'::text[]`).notNull(),
    formats: text('formats').array().default(sql`'{}'::text[]`).notNull(),
    themes: text('themes').array().default(sql`'{}'::text[]`).notNull(),
    goals: text('goals').array().default(sql`'{}'::text[]`).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  () => [
    pgPolicy('Owners manage their own preferences', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = user_id`,
      withCheck: sql`(select public.current_user_id()) = user_id`,
    }),
  ],
)

// ── Admins (RFC-006 D6) ──────────────────────────────────────────────────────
// Staff accounts, inserted manually in the database. Not a `users` column:
// users can UPDATE their own row, so a flag there could be self-granted. No
// privileges for anon/authenticated — read only through public.is_admin()
// (SECURITY DEFINER, drizzle/0022_interpreters.sql).

export const admins = pgTable('admins', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}).enableRLS()

// ── Interpreter profiles (RFC-006 phase 2) ───────────────────────────────────
// Actor/narrator registration, reviewed by the staff before it counts. The
// owner submits (always back to `pending`); only admins approve or reject.
// The presentation media lives under the private `interpreters/` S3 prefix and
// is served through presigned GET URLs.

export const interpreterModalityEnum = pgEnum('interpreter_modality', ['acting', 'narration'])
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected'])

export const interpreterProfiles = pgTable(
  'interpreter_profiles',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    modalities: interpreterModalityEnum('modalities').array().notNull(),
    status: reviewStatusEnum('status').default('pending').notNull(),
    // S3 key `interpreters/{userId}/...`; video when acting, audio when only narrating.
    mediaPath: text('media_path').notNull(),
    mediaType: text('media_type').notNull(),
    durationSeconds: integer('duration_seconds').notNull(),
    birthDate: date('birth_date').notNull(),
    experience: text('experience'),
    ageRange: text('age_range'),
    languages: text('languages'),
    drt: text('drt'),
    // Image/voice use consent (RFC-006 D4); provisional wording, see lib/constants/interpreters.ts.
    consentAt: timestamp('consent_at').notNull(),
    reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at'),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('interpreter_profiles_status_idx').on(table.status),
    check('interpreter_profiles_media_type_check', sql`${table.mediaType} in ('video', 'audio')`),
    check('interpreter_profiles_duration_check', sql`${table.durationSeconds} between 1 and 30`),
    check('interpreter_profiles_modalities_check', sql`cardinality(${table.modalities}) between 1 and 2`),
    pgPolicy('Owners and admins read interpreter profiles', {
      as: 'permissive',
      to: 'authenticated',
      for: 'select',
      using: sql`(select public.current_user_id()) = user_id or (select public.is_admin())`,
    }),
    // Submitting (insert or resubmit) always lands in review, by an adult (RFC-006 D5).
    pgPolicy('Owners submit their interpreter profile', {
      as: 'permissive',
      to: 'authenticated',
      for: 'insert',
      withCheck: sql`(select public.current_user_id()) = user_id and status = 'pending' and reviewed_by is null and birth_date <= current_date - interval '18 years'`,
    }),
    pgPolicy('Owners resubmit their interpreter profile', {
      as: 'permissive',
      to: 'authenticated',
      for: 'update',
      using: sql`(select public.current_user_id()) = user_id`,
      withCheck: sql`(select public.current_user_id()) = user_id and status = 'pending' and reviewed_by is null and birth_date <= current_date - interval '18 years'`,
    }),
    pgPolicy('Admins review interpreter profiles', {
      as: 'permissive',
      to: 'authenticated',
      for: 'update',
      using: sql`(select public.is_admin())`,
      withCheck: sql`(select public.is_admin())`,
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
    // Up to MAX_SUBGENRES additional genres drawn from the same GENRES list.
    subgenres: text('subgenres').array(),
    ageRating: text('age_rating'),
    // Registration number of the work at the Biblioteca Nacional. Required to
    // publish (status = 'published'), optional for drafts/cadastro.
    bnRegistration: text('bn_registration'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    status: scriptStatusEnum('status').default('published').notNull(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bannerPath: text('banner_path'),
    coverPath: text('cover_path'),
    pitchDeckPath: text('pitch_deck_path'),
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
      using: sql`(select public.current_user_id()) = author_id`,
      withCheck: sql`(select public.current_user_id()) = author_id`,
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
  (table) => [
    uniqueIndex('script_files_script_id_unique').on(table.scriptId),
    pgPolicy('Script files follow script visibility', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`exists(select 1 from scripts where id = script_id and (status = 'published' or (select public.current_user_id()) = author_id))`,
    }),
    pgPolicy('Authors manage their script files', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = (select author_id from scripts where id = script_id)`,
      withCheck: sql`(select public.current_user_id()) = (select author_id from scripts where id = script_id)`,
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
    // Preset category (see AUDIO_CATEGORIES). Default backfills rows created
    // before the multi-audio migration (item 10); new rows always set it.
    title: text('title').notNull().default('Roteiro falado'),
    description: text('description'),
    sortOrder: integer('sort_order').default(0).notNull(),
    durationSeconds: integer('duration_seconds'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  // A script may now have multiple audio files — no unique index on script_id.
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
      using: sql`(select public.current_user_id()) = (select author_id from scripts where id = script_id)`,
      withCheck: sql`(select public.current_user_id()) = (select author_id from scripts where id = script_id)`,
    }),
  ],
)

// ── Script Characters ─────────────────────────────────────────────────────────
// Optional cast of a script, created in the publish flow. Deleting the script
// deletes its characters (cascade). `traits` are free-form tags; suggestions
// come from the traits already in use (see search_character_traits RPC).

export const scriptCharacters = pgTable(
  'script_characters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scriptId: uuid('script_id')
      .notNull()
      .references(() => scripts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    // Free text so authors can give ranges ("30–35") or approximations.
    apparentAge: text('apparent_age'),
    gender: text('gender'),
    traits: text('traits').array().default(sql`'{}'::text[]`).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('script_characters_script_id_idx').on(table.scriptId),
    pgPolicy('Script characters follow script visibility', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`exists(select 1 from scripts where id = script_id and (status = 'published' or (select public.current_user_id()) = author_id))`,
    }),
    pgPolicy('Authors manage their script characters', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = (select author_id from scripts where id = script_id)`,
      withCheck: sql`(select public.current_user_id()) = (select author_id from scripts where id = script_id)`,
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
      using: sql`deleted_at is null and exists(select 1 from scripts where id = script_id and status = 'published')`,
    }),
    pgPolicy('Authenticated users can create comments', {
      as: 'permissive',
      to: 'authenticated',
      for: 'insert',
      withCheck: sql`(select public.current_user_id()) = author_id`,
    }),
    pgPolicy('Authors manage their own comments', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = author_id`,
      withCheck: sql`(select public.current_user_id()) = author_id`,
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
      using: sql`(select public.current_user_id()) = user_id`,
      withCheck: sql`(select public.current_user_id()) = user_id`,
    }),
  ],
)

// ── User Follows ──────────────────────────────────────────────────────────────

export const userFollows = pgTable(
  'user_follows',
  {
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followeeId: uuid('followee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followeeId] }),
    pgPolicy('Follow relationships are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`true`,
    }),
    pgPolicy('Authenticated users manage their own follows', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = follower_id`,
      withCheck: sql`(select public.current_user_id()) = follower_id`,
    }),
  ],
)

// ── Comment Reactions ─────────────────────────────────────────────────────────

export const commentReactions = pgTable(
  'comment_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('comment_reactions_unique').on(table.commentId, table.userId, table.emoji),
    pgPolicy('Reactions are publicly readable', {
      as: 'permissive',
      to: 'public',
      for: 'select',
      using: sql`true`,
    }),
    pgPolicy('Authenticated users manage their own reactions', {
      as: 'permissive',
      to: 'authenticated',
      for: 'all',
      using: sql`(select public.current_user_id()) = user_id`,
      withCheck: sql`(select public.current_user_id()) = user_id`,
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
  characters: many(scriptCharacters),
  comments: many(comments),
  ratings: many(ratings),
}))

export const scriptFilesRelations = relations(scriptFiles, ({ one }) => ({
  script: one(scripts, { fields: [scriptFiles.scriptId], references: [scripts.id] }),
}))

export const audioFilesRelations = relations(audioFiles, ({ one }) => ({
  script: one(scripts, { fields: [audioFiles.scriptId], references: [scripts.id] }),
}))

export const scriptCharactersRelations = relations(scriptCharacters, ({ one }) => ({
  script: one(scripts, { fields: [scriptCharacters.scriptId], references: [scripts.id] }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  script: one(scripts, { fields: [comments.scriptId], references: [scripts.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  reactions: many(commentReactions),
}))

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, { fields: [commentReactions.commentId], references: [comments.id] }),
  user: one(users, { fields: [commentReactions.userId], references: [users.id] }),
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
export type ScriptCharacter = typeof scriptCharacters.$inferSelect
export type Comment = typeof comments.$inferSelect
export type Rating = typeof ratings.$inferSelect
export type CommentReaction = typeof commentReactions.$inferSelect

export type NewScript = typeof scripts.$inferInsert
export type NewComment = typeof comments.$inferInsert
export type NewRating = typeof ratings.$inferInsert
export type UserFollow = typeof userFollows.$inferSelect
