# [07] Perfil — Página pública do roteirista e avaliações

> ClickUp: https://app.clickup.com/t/86agq8zbq
> Status: pendentes · Priority: normal · Depends on: [02] DB Schema, [03] Auth, [04] Upload

## Contexto

Perfil público do roteirista e sistema de avaliação por estrelas. Fecha o ciclo de feedback da POC.

**Arquivos a criar:**

- `server/api/ratings.ts` — router tRPC de avaliações
- `app/profile/[userId]/page.tsx` — perfil público (Server Component)
- `app/profile/[userId]/profile-client.tsx` — Client Component
- `app/(authenticated)/account/page.tsx` — profile editing (protected via route group)

**Arquivos a atualizar:**

- `server/api/root.ts` — registrar `ratingsRouter`
- `app/scripts/[id]/script-page-client.tsx` — integrar StarRating + média
- `components/ui/script-card.tsx` — receber `rating` como prop real

**Componente disponível:** `StarRating` (`components/ui/star-rating.tsx`)

---

## Referência de design (Figma)

| Tela                     | Node ID   | Descrição                              |
| ------------------------ | --------- | -------------------------------------- |
| PDF Reader (script page) | `51:1007` | Área de avaliação na página do roteiro |

**Componentes Figma a usar:**

| Componente   | Node ID  | Uso                                                         |
| ------------ | -------- | ----------------------------------------------------------- |
| `StarRating` | `13:133` | Avaliação 1–5 estrelas (props: value, max, readOnly, Title) |
| `RatingBox`  | `38:123` | Container da avaliação na página do roteiro                 |
| `Avatar`     | `38:115` | Foto de perfil do roteirista (círculo, 80×80px)             |
| `ScriptCard` | `3:51`   | Card de roteiro na listagem do perfil                       |

**Tokens de design:**

| Elemento            | Tailwind class                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Fundo da página     | `bg-base`                                                                                                            |
| Container           | `max-w-[960px] mx-auto px-5 py-12`                                                                                   |
| Header do perfil    | `flex items-start gap-5`                                                                                             |
| Avatar (sem foto)   | `w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center text-2xl font-display text-brand-accent` |
| Nome do roteirista  | `font-display text-heading-2` (DM Serif Display 32px)                                                                |
| Bio                 | `text-secondary text-body-default mt-1 max-w-lg`                                                                     |
| Título de seção     | `font-display text-heading-3 text-primary mb-4`                                                                      |
| Grid de roteiros    | `grid grid-cols-1 md:grid-cols-2 gap-4`                                                                              |
| Mensagem vazia      | `text-muted text-body-small`                                                                                         |
| Estrelas ativas     | `text-brand-accent` (fill)                                                                                           |
| Estrelas inativas   | `text-border-default`                                                                                                |
| Média e total       | `font-mono text-label-mono-default text-secondary` (DM Mono)                                                         |
| Formulário de conta | `max-w-sm flex flex-col gap-6`                                                                                       |
| Label de campo      | `font-mono text-label-mono-caps text-secondary uppercase tracking-wider text-xs`                                     |

**RatingBox (na página do roteiro):**

- Contém: StarRating + texto "X avaliações" em DM Mono
- Exibe a média numérica em DM Serif Display ao lado
- Usuário não autenticado: readonly, link para login
- Usuário autenticado: interativo, seleciona 1–5

---

## Passos de execução

### 1. Criar router tRPC de avaliações

Criar `server/api/ratings.ts`:

```typescript
import { db } from '@/server/db'
import { ratings, scripts } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { eq, and, avg, count } from 'drizzle-orm'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const ratingsRouter = createTRPCRouter({
  upsert: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        userId: z.string().uuid(),
        score: z.number().int().min(1).max(5),
      }),
    )
    .mutation(async ({ input }) => {
      const script = await db.query.scripts.findFirst({
        where: (s, { eq }) => eq(s.id, input.scriptId),
        columns: { authorId: true },
      })

      if (script?.authorId === input.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não pode avaliar seu próprio roteiro.',
        })
      }

      await db
        .insert(ratings)
        .values(input)
        .onConflictDoUpdate({
          target: [ratings.scriptId, ratings.userId],
          set: { score: input.score },
        })
    }),

  getAverage: publicProcedure.input(z.object({ scriptId: z.string().uuid() })).query(async ({ input }) => {
    const result = await db
      .select({
        average: avg(ratings.score),
        total: count(ratings.id),
      })
      .from(ratings)
      .where(eq(ratings.scriptId, input.scriptId))

    return {
      average: result[0]?.average ? Number(result[0].average) : 0,
      total: result[0]?.total ?? 0,
    }
  }),

  getUserRating: publicProcedure
    .input(
      z.object({
        scriptId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const rating = await db.query.ratings.findFirst({
        where: (r, { eq, and }) => and(eq(r.scriptId, input.scriptId), eq(r.userId, input.userId)),
      })
      return rating?.score ?? null
    }),
})
```

### 2. Registrar router

```typescript
// server/api/root.ts
import { ratingsRouter } from './ratings'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  scripts: scriptsRouter,
  comments: commentsRouter,
  ratings: ratingsRouter,
})
```

### 3. Integrar StarRating na página do roteiro

Atualizar `app/scripts/[id]/script-page-client.tsx`:

```typescript
import { StarRating } from '@/components/ui/star-rating'

// RatingBox (ref: 38:123) — inserir na área de metadados do roteiro
<div className="flex items-center gap-3 p-3 bg-elevated rounded-sm border border-subtle">
  <StarRating
    value={userRating ?? 0}
    onChange={(score) => {
      if (!userId) { router.push('/auth/login'); return }
      upsertRating.mutate({ scriptId, userId, score })
    }}
    readonly={!userId}
  />
  {ratingData && ratingData.total > 0 && (
    <span className="font-mono text-label-mono-default text-secondary">
      {ratingData.average.toFixed(1)} · {ratingData.total} {ratingData.total === 1 ? 'avaliação' : 'avaliações'}
    </span>
  )}
</div>
```

> Verificar a API do componente `StarRating` em `components/ui/star-rating.tsx` e ajustar props conforme necessário. A prop `Title` no Figma corresponde ao label textual da categoria (ex: "Narrativa", "Diálogos").

### 4. Criar página de perfil público

Criar `app/profile/[userId]/page.tsx` (Server Component):

```typescript
import { trpc, HydrateClient } from '@/trpc/server'
import { ProfileClient } from './profile-client'

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params

  await Promise.all([
    trpc.users.getProfile.prefetch({ id: userId }),
    trpc.scripts.listByAuthor.prefetch({ authorId: userId }),
  ])

  return (
    <HydrateClient>
      <ProfileClient userId={userId} />
    </HydrateClient>
  )
}
```

Criar `app/profile/[userId]/profile-client.tsx` (Client Component):

```typescript
'use client'

import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { ScriptCard } from '@/components/ui/script-card'
import Link from 'next/link'

export function ProfileClient({ userId }: { userId: string }) {
  const trpc = useTRPC()
  const { data: user } = useQuery(trpc.users.getProfile.queryOptions({ id: userId }))
  const { data: scriptList } = useQuery(trpc.scripts.listByAuthor.queryOptions({ authorId: userId }))

  if (!user) return <p className="text-muted text-body-small">Perfil não encontrado.</p>

  return (
    <main className="max-w-[960px] mx-auto px-5 py-12 flex flex-col gap-10">

      {/* Header do perfil — ref: Avatar (38:115) */}
      <section className="flex items-start gap-5">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border border-subtle"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center text-2xl font-display text-brand-accent shrink-0">
            {user.name[0]}
          </div>
        )}
        <div className="flex flex-col gap-1 pt-1">
          <h1 className="font-display text-heading-2 text-primary">{user.name}</h1>
          {user.bio && (
            <p className="text-secondary text-body-default max-w-lg">{user.bio}</p>
          )}
        </div>
      </section>

      {/* Roteiros do autor */}
      <section>
        <h2 className="font-display text-heading-3 text-primary mb-4">Roteiros publicados</h2>
        {scriptList && scriptList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scriptList.map((script) => (
              <Link key={script.id} href={`/scripts/${script.id}`}>
                <ScriptCard
                  title={script.title}
                  author={user.name}
                  genre={script.genre ?? ''}
                  rating={0}
                  pages={0}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted text-body-small">Nenhum roteiro publicado ainda.</p>
        )}
      </section>
    </main>
  )
}
```

### 5. Criar página de edição de perfil

Criar `app/account/page.tsx` (Client Component, rota protegida):

```typescript
'use client'

import { useTRPC } from '@/trpc/client'
import { createClient } from '@/lib/supabase/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  bio: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof profileSchema>

export default function MyAccountPage() {
  const trpc = useTRPC()
  const supabase = createClient()

  // 1. Obter userId da sessão
  // 2. Carregar perfil atual via trpc.users.getProfile
  // 3. Prefill do formulário com os dados atuais
  // 4. Submit: trpc.users.updateProfile.mutate({ id, name, bio })
  // 5. Upload de avatar: supabase.storage.from('avatars').upload(path, file)
  //    → após upload: trpc.users.updateProfile.mutate({ id, image: publicUrl })
}
```

**Layout da página /account:**

- Container `max-w-sm mx-auto px-5 py-12`
- Título: `font-display text-heading-2` — "Minha conta"
- Seção de avatar: círculo 80px + botão de troca de foto
- Formulário: `flex flex-col gap-6`
- Labels em DM Mono uppercase (`font-mono text-label-mono-caps text-secondary uppercase`)

### 6. Conectar rating médio no ScriptCard

Atualizar `HomeClient` e `ProfileClient` para buscar e passar a média real ao `ScriptCard` depois que `ratingsRouter` existir.

> Para a POC, pode passar `rating={0}` inicialmente. Na iteração seguinte, buscar média via `ratings.getAverage` para cada script.

---

## Validação

```bash
yarn build
yarn lint
```

**Fluxo end-to-end (yarn dev):**

- [ ] `/profile/[userId]` acessível sem login, mostra avatar (inicial), nome, bio e roteiros do autor
- [ ] Usuário autenticado avalia roteiro com 1–5 estrelas em `/scripts/[id]`
- [ ] Tentar avaliar o próprio roteiro retorna erro "Você não pode avaliar seu próprio roteiro"
- [ ] Submeter nova nota atualiza a média exibida sem reload
- [ ] `/account` acessível apenas para usuários autenticados
- [ ] Editar nome/bio salva corretamente na tabela `users`
- [ ] Upload de avatar aparece no bucket `avatars` e atualiza a imagem no perfil
- [ ] Visual: Avatar com inicial em brand-accent, nome em DM Serif Display, média em DM Mono

## Checklist de aceite

- [ ] `ratingsRouter` com `upsert`, `getAverage`, `getUserRating`
- [ ] Auto-avaliação bloqueada com `TRPCError FORBIDDEN`
- [ ] Upsert funciona (segunda avaliação substitui a primeira)
- [ ] Perfil público `/profile/[userId]` acessível sem login
- [ ] Avatar com inicial do nome em `bg-brand-accent/20` quando sem foto
- [ ] Nome em `font-display text-heading-2`
- [x] Avatar com inicial do nome em `bg-brand-accent/20` quando sem foto
- [x] Nome em `font-display text-heading-2`
- [ ] StarRating interativo na página do roteiro
- [ ] Média atualiza sem reload (invalidação TanStack Query)
- [ ] `yarn build` limpo
