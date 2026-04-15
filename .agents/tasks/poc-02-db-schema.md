# [02] DB Schema — Modelagem Drizzle e migrations

> ClickUp: https://app.clickup.com/t/86agq8yhn
> Status: em progresso · Priority: urgent · Depends on: nenhuma
> **BLOQUEADOR** — todas as demais tasks dependem desta

## Contexto

**Arquivo único de schema:** `server/db/schema.ts`
**Config Drizzle:** `drizzle.config.ts` (aponta para `server/db/schema.ts`, migrations em `drizzle/`)
**Client Drizzle:** `server/db/index.ts` (usa `DATABASE_URL`, `prepare: false` obrigatório)

Hoje existe apenas a tabela `users`. Precisam ser criadas: `scripts`, `script_files`, `audio_files`, `comments`, `ratings`.

**Env vars necessárias:**
- `DATABASE_URL` — transaction pooler (porta 6543) — runtime
- `DATABASE_URL_UNPOOLED` — session pooler (porta 5432) — apenas migrations

## Schema completo a implementar

Substituir o conteúdo de `server/db/schema.ts` pelo schema abaixo:

```typescript
import { sql } from 'drizzle-orm'
import {
  integer,
  pgPolicy,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
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
    status: text('status').default('published').notNull(), // 'draft' | 'published'
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

// ── Tipos inferidos (usar nos routers tRPC) ───────────────────────────────────

export type User = typeof users.$inferSelect
export type Script = typeof scripts.$inferSelect
export type ScriptFile = typeof scriptFiles.$inferSelect
export type AudioFile = typeof audioFiles.$inferSelect
export type Comment = typeof comments.$inferSelect
export type Rating = typeof ratings.$inferSelect

export type NewScript = typeof scripts.$inferInsert
export type NewComment = typeof comments.$inferInsert
export type NewRating = typeof ratings.$inferInsert
```

## Passos de execução

### 1. Atualizar schema

Substituir `server/db/schema.ts` com o schema acima.

### 2. Gerar migration

```bash
yarn drizzle-kit generate
```

Verificar o arquivo gerado em `drizzle/`. Revisar o SQL antes de aplicar.

### 3. Aplicar migration

```bash
yarn drizzle-kit migrate
```

> Usa `DATABASE_URL_UNPOOLED` (session pooler) — nunca o transaction pooler para migrations.

### 4. Criar Storage Buckets no Supabase

No painel Supabase → Storage → New Bucket:

**Bucket `scripts`** (PDFs):
- Name: `scripts`
- Public: **sim** (leitura pública de PDFs)
- File size limit: 52428800 (50MB)
- Allowed MIME types: `application/pdf`

**Bucket `audio`** (áudios):
- Name: `audio`
- Public: **sim**
- File size limit: 104857600 (100MB)
- Allowed MIME types: `audio/mpeg,audio/mp4,audio/wav`

**Bucket `avatars`** (fotos de perfil):
- Name: `avatars`
- Public: **sim**
- File size limit: 5242880 (5MB)
- Allowed MIME types: `image/jpeg,image/png,image/webp`

### 5. Configurar CORS nos buckets (necessário para pdf.js)

No painel Supabase → Storage → bucket `scripts` → CORS:

```json
[
  {
    "allowedOrigins": ["http://localhost:3000", "https://*.vercel.app"],
    "allowedMethods": ["GET", "HEAD"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

## Validação

```bash
yarn drizzle-kit generate   # zero erros
yarn build                  # zero type errors com novos tipos inferidos
```

**Verificação manual no painel Supabase:**
- [ ] Tabelas `users`, `scripts`, `script_files`, `audio_files`, `comments`, `ratings` existem
- [ ] Coluna `bio` adicionada em `users`
- [ ] Constraint `ratings_script_user_unique` existe em `ratings`
- [ ] Buckets `scripts`, `audio`, `avatars` criados com políticas corretas
- [ ] CORS configurado no bucket `scripts`

## Checklist de aceite

- [ ] Migration gerada sem erros
- [ ] Migration aplicada no Supabase sem erros
- [ ] 6 tabelas visíveis no painel com colunas e FKs corretas
- [ ] 3 Storage buckets criados (`scripts`, `audio`, `avatars`)
- [ ] `yarn build` passa com os tipos Drizzle inferidos
- [ ] Exports de tipos (`User`, `Script`, `Comment`, etc.) disponíveis em `server/db/schema.ts`
