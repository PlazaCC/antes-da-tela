# [07] Perfil — Página pública do roteirista e avaliações

> ClickUp: https://app.clickup.com/t/86agq8zbq
> Status: pendentes · Priority: normal · Depends on: [02] DB Schema, [03] Auth, [04] Upload

## Contexto

Perfil público do roteirista e sistema de avaliação por estrelas. Fecha o ciclo de feedback da POC.

**Arquivos a criar:**
- `server/api/ratings.ts` — router tRPC de avaliações
- `app/perfil/[userId]/page.tsx` — perfil público (Server Component)
- `app/perfil/[userId]/profile-client.tsx` — Client Component
- `app/minha-conta/page.tsx` — edição de perfil

**Arquivos a atualizar:**
- `server/api/root.ts` — registrar `ratingsRouter`
- `app/roteiros/[id]/script-page-client.tsx` — integrar StarRating + média
- `components/ui/script-card.tsx` — receber `rating` como prop real

**Componente disponível:** `StarRating` (`components/ui/star-rating.tsx`)

## Passos de execução

### 1. Criar router tRPC de avaliações

Criar `server/api/ratings.ts`:

```typescript
import { db } from '@/server/db'
import { ratings, scripts } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { eq, and, avg, count, sql } from 'drizzle-orm'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const ratingsRouter = createTRPCRouter({
  // Upsert: 1 voto por usuário por roteiro
  upsert: publicProcedure
    .input(z.object({
      scriptId: z.string().uuid(),
      userId: z.string().uuid(),
      score: z.number().int().min(1).max(5),
    }))
    .mutation(async ({ input }) => {
      // Bloquear auto-avaliação
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

  getAverage: publicProcedure
    .input(z.object({ scriptId: z.string().uuid() }))
    .query(async ({ input }) => {
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

  // Voto do usuário atual num roteiro específico
  getUserRating: publicProcedure
    .input(z.object({
      scriptId: z.string().uuid(),
      userId: z.string().uuid(),
    }))
    .query(async ({ input }) => {
      const rating = await db.query.ratings.findFirst({
        where: (r, { eq, and }) =>
          and(eq(r.scriptId, input.scriptId), eq(r.userId, input.userId)),
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

Atualizar `app/roteiros/[id]/script-page-client.tsx`:

```typescript
import { StarRating } from '@/components/ui/star-rating'
import { useTRPC } from '@/trpc/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Dentro do componente:
const trpc = useTRPC()
const queryClient = useQueryClient()

const { data: ratingData } = useQuery(
  trpc.ratings.getAverage.queryOptions({ scriptId })
)

const { data: userRating } = useQuery(
  userId
    ? trpc.ratings.getUserRating.queryOptions({ scriptId, userId })
    : { queryKey: ['ratings', 'user', null], queryFn: () => null, enabled: false }
)

const upsertRating = useMutation({
  ...trpc.ratings.upsert.mutationOptions(),
  onSuccess: () => {
    queryClient.invalidateQueries(trpc.ratings.getAverage.queryOptions({ scriptId }))
    queryClient.invalidateQueries(trpc.ratings.getUserRating.queryOptions({ scriptId, userId: userId! }))
  },
})

// No JSX:
<div className="flex items-center gap-3">
  <StarRating
    value={userRating ?? 0}
    onChange={(score) => {
      if (!userId) return // redirecionar para login
      upsertRating.mutate({ scriptId, userId, score })
    }}
    readonly={!userId}
  />
  {ratingData && ratingData.total > 0 && (
    <span className="text-sm text-muted-foreground">
      {ratingData.average.toFixed(1)} · {ratingData.total} avaliações
    </span>
  )}
</div>
```

> Verificar a API do componente `StarRating` em `components/ui/star-rating.tsx` e ajustar props conforme necessário.

### 4. Criar página de perfil público

Criar `app/perfil/[userId]/page.tsx` (Server Component):

```typescript
import { trpc, HydrateClient } from '@/trpc/server'
import { ProfileClient } from './profile-client'

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  await Promise.all([
    trpc.users.getProfile.prefetch({ id: params.userId }),
    trpc.scripts.listByAuthor.prefetch({ authorId: params.userId }),
  ])

  return (
    <HydrateClient>
      <ProfileClient userId={params.userId} />
    </HydrateClient>
  )
}
```

Criar `app/perfil/[userId]/profile-client.tsx` (Client Component):

```typescript
'use client'

import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { ScriptCard } from '@/components/ui/script-card'
import Link from 'next/link'
import Image from 'next/image'

export function ProfileClient({ userId }: { userId: string }) {
  const trpc = useTRPC()

  const { data: user } = useQuery(trpc.users.getProfile.queryOptions({ id: userId }))
  const { data: scriptList } = useQuery(trpc.scripts.listByAuthor.queryOptions({ authorId: userId }))

  if (!user) return <p className="text-muted-foreground">Perfil não encontrado.</p>

  return (
    <main className="max-w-4xl mx-auto px-5 py-12 flex flex-col gap-10">
      {/* Header do perfil */}
      <section className="flex items-start gap-5">
        {user.image ? (
          <Image src={user.image} alt={user.name} width={80} height={80} className="rounded-full" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
            {user.name[0]}
          </div>
        )}
        <div>
          <h1 className="text-heading-2 font-semibold">{user.name}</h1>
          {user.bio && <p className="text-body-default text-muted-foreground mt-1">{user.bio}</p>}
        </div>
      </section>

      {/* Roteiros do autor */}
      <section>
        <h2 className="text-heading-3 font-semibold mb-4">Roteiros publicados</h2>
        {scriptList && scriptList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scriptList.map((script) => (
              <Link key={script.id} href={`/roteiros/${script.id}`}>
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
          <p className="text-muted-foreground text-sm">Nenhum roteiro publicado ainda.</p>
        )}
      </section>
    </main>
  )
}
```

### 5. Criar página de edição de perfil

Criar `app/minha-conta/page.tsx` (Client Component, rota protegida pelo middleware):

```typescript
'use client'

import { useTRPC } from '@/trpc/client'
import { createBrowserClient } from '@/lib/supabase/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
})

export default function MyAccountPage() {
  const trpc = useTRPC()
  const supabase = createBrowserClient()
  // Obter userId da sessão atual via supabase.auth.getUser()
  // Formulário com prefill dos dados atuais
  // Upload de avatar: supabase.storage.from('avatars').upload(path, file)
  // Após upload: trpc.users.updateProfile.mutate({ id, image: publicUrl })
  // Submit do formulário: trpc.users.updateProfile.mutate({ id, name, bio })
}
```

### 6. Conectar rating médio no ScriptCard (home)

Depois que `ratingsRouter.getAverage` existir, atualizar `HomeClient` e `ProfileClient` para buscar e passar a média real ao `ScriptCard`.

> Estratégia eficiente: buscar média de todos os roteiros da lista em batch via um endpoint `ratings.getAverages(scriptIds[])` — opcional para POC, pode usar 0 inicialmente.

## Validação

```bash
yarn build
yarn lint
```

**Fluxo end-to-end (yarn dev):**
- [ ] `/perfil/[userId]` acessível sem login, mostra roteiros do autor
- [ ] Usuário autenticado dá nota 1–5 em `/roteiros/[id]`
- [ ] Tentar avaliar o próprio roteiro retorna erro "não pode avaliar seu próprio roteiro"
- [ ] Submeter nova nota atualiza a média exibida sem reload
- [ ] `/minha-conta` acessível apenas para usuários autenticados
- [ ] Editar nome/bio salva corretamente na tabela `users`
- [ ] Upload de avatar aparece no bucket `avatars` e atualiza a imagem no perfil

## Checklist de aceite

- [ ] `ratingsRouter` com `upsert`, `getAverage`, `getUserRating`
- [ ] Auto-avaliação bloqueada com `TRPCError FORBIDDEN`
- [ ] Upsert funciona (segunda avaliação substitui a primeira)
- [ ] Perfil público `/perfil/[userId]` sem login
- [ ] StarRating interativo na página do roteiro
- [ ] Média atualiza sem reload (invalidação TanStack Query)
- [ ] `yarn build` limpo
