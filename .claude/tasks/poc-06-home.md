# [06] Home — Listagem de roteiros e descoberta

> ClickUp: https://app.clickup.com/t/86agq8z5g
> Status: pendentes · Priority: high · Depends on: [02] DB Schema, [04] Upload

## Contexto

Página inicial da POC. Hub de descoberta com SSR obrigatório para SEO e TanStack Query para interatividade client-side.

**Arquivos a criar:**
- `app/page.tsx` — Server Component com prefetch tRPC
- `app/home-client.tsx` — Client Component com filtros e busca

**Componentes disponíveis:** `ScriptCard` (`components/ui/script-card.tsx`), `Input`, `Button`, Tag

**Regras:** `.agents/rules/nextjs.md` (SSR prefetch pattern), `.agents/rules/typescript.md`

## Passos de execução

### 1. Atualizar app/page.tsx (Server Component com SSR)

```typescript
// app/page.tsx
import { trpc, HydrateClient } from '@/trpc/server'
import { HomeClient } from './home-client'

export default async function HomePage() {
  // Prefetch em paralelo no servidor
  await Promise.all([
    trpc.scripts.listRecent.prefetch({ limit: 12 }),
    trpc.scripts.listFeatured.prefetch(),
  ])

  return (
    <HydrateClient>
      <HomeClient />
    </HydrateClient>
  )
}
```

### 2. Criar app/home-client.tsx (Client Component)

```typescript
'use client'

import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce' // criar se não existir
import { ScriptCard } from '@/components/ui/script-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const GENRES = ['drama', 'thriller', 'comédia', 'ficção científica', 'terror', 'romance', 'documentário', 'animação'] as const

export function HomeClient() {
  const trpc = useTRPC()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState<string | undefined>()
  const debouncedSearch = useDebounce(search, 300)

  const { data: featured } = useQuery(trpc.scripts.listFeatured.queryOptions())

  const { data: recent } = useQuery(
    debouncedSearch || genre
      ? trpc.scripts.search.queryOptions({ query: debouncedSearch || '*', genre: genre as any })
      : trpc.scripts.listRecent.queryOptions({ limit: 12 })
  )

  return (
    <main className="max-w-6xl mx-auto px-5 py-12 flex flex-col gap-12">
      {/* Hero / busca */}
      <section className="flex flex-col gap-4">
        <h1 className="font-display text-display-hero">Antes da Tela</h1>
        <p className="text-body-large text-muted-foreground max-w-xl">
          Roteiros audiovisuais para ler, comentar e descobrir.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Buscar roteiros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          {/* Filtro de gênero */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!genre ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGenre(undefined)}
            >
              Todos
            </Button>
            {GENRES.map((g) => (
              <Button
                key={g}
                variant={genre === g ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGenre(genre === g ? undefined : g)}
              >
                {g}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Em destaque */}
      {featured && featured.length > 0 && !debouncedSearch && !genre && (
        <section className="flex flex-col gap-4">
          <h2 className="text-heading-3 font-semibold">Em destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((script) => (
              <Link key={script.id} href={`/roteiros/${script.id}`}>
                <ScriptCard
                  title={script.title}
                  author={script.author?.name ?? ''}
                  genre={script.genre ?? ''}
                  rating={0} // substituir por média real na task [07]
                  pages={0}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Listagem recente / busca */}
      <section className="flex flex-col gap-4">
        <h2 className="text-heading-3 font-semibold">
          {debouncedSearch || genre ? 'Resultados' : 'Roteiros recentes'}
        </h2>
        {recent?.items && recent.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.items.map((script) => (
              <Link key={script.id} href={`/roteiros/${script.id}`}>
                <ScriptCard
                  title={script.title}
                  author={script.author?.name ?? ''}
                  genre={script.genre ?? ''}
                  rating={0}
                  pages={0}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {debouncedSearch ? 'Nenhum roteiro encontrado.' : 'Ainda não há roteiros publicados.'}
          </p>
        )}
      </section>
    </main>
  )
}
```

### 3. Criar hook useDebounce (se não existir)

Criar `lib/hooks/use-debounce.ts`:

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

### 4. Atualizar ScriptCard para receber rating e pages opcionais

Verificar `components/ui/script-card.tsx`. Se `rating` e `pages` forem obrigatórios, tornar opcionais com default `0` para suportar uso antes dos dados de rating estarem disponíveis.

## Validação

```bash
yarn build
yarn lint
```

**Verificação (yarn dev):**
- [ ] `view-source:http://localhost:3000` contém os títulos dos roteiros (SSR confirmado)
- [ ] Digitando na busca, listagem filtra após 300ms sem request por tecla (verificar Network tab)
- [ ] Clicar em filtro de gênero refiltra a grid
- [ ] Clicar em ScriptCard navega para `/roteiros/[id]`
- [ ] Responsivo: grid 1 coluna em mobile (375px), 3 colunas em desktop (1280px)
- [ ] Seção "em destaque" aparece apenas para roteiros com `is_featured = true`

## Checklist de aceite

- [ ] `app/page.tsx` é Server Component com prefetch via `HydrateClient`
- [ ] Roteiros visíveis no source HTML (SSR)
- [ ] Busca com debounce 300ms
- [ ] Filtro por gênero funcional
- [ ] Grid responsiva em mobile e desktop
- [ ] Seção featured separada da listagem recente
- [ ] `yarn build` limpo
