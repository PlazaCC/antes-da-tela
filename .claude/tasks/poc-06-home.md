# [06] Home — Listagem de roteiros e descoberta

> ClickUp: https://app.clickup.com/t/86agq8z5g
> Status: pendentes · Priority: high · Depends on: [02] DB Schema, [04] Upload

## Contexto

Página inicial da POC. Hub de descoberta com SSR obrigatório para SEO e TanStack Query para interatividade client-side.

**Arquivos a criar:**
- `app/page.tsx` — Server Component com prefetch tRPC
- `app/home-client.tsx` — Client Component com filtros e busca

**Componentes disponíveis:** `ScriptCard`, `Input`, `Button`, `Tag`, `NavBar`

**Regras:** `.agents/rules/nextjs.md` (SSR prefetch pattern), `.agents/rules/typescript.md`

---

## Referência de design (Figma)

| Tela | Node ID | Descrição |
|------|---------|-----------|
| Home | `51:562` | Tela principal com feed de roteiros |
| Search Sheet | `51:820` | Busca com resultados em overlay/sheet |
| Filter Page | `51:930` | Página de filtros por gênero/classificação |

**Componentes Figma a usar:**

| Componente | Node ID | Uso |
|------------|---------|-----|
| `NavBar` | `13:137` | Barra de navegação superior fixa |
| `Logo` | `28:56` | Logotipo no NavBar |
| `ScriptCard` | `3:51` | Card de roteiro na grid |
| `Input` | `3:66` | Campo de busca |
| `Tag` | `13:95` | Filtro de gênero (variant: drama, thriller, etc.) |
| `Button` | `13:84` | CTA "Publicar" + botão "Todos" nos filtros |
| `FilterSectionHeader` | `48:1122` | Header de seção de filtros |
| `Checkbox` | `48:1107` | Filtros na Filter Page |

**Tokens de design:**

| Elemento | Tailwind class |
|----------|---------------|
| Fundo da página | `bg-base` |
| NavBar | `bg-base border-b border-subtle sticky top-0 z-50` |
| Container principal | `max-w-[1140px] mx-auto px-5` |
| Seção hero | `py-16` |
| Título hero | `font-display text-display` (DM Serif Display 56px) |
| Subtítulo | `text-secondary text-body-large max-w-xl` |
| CTA "Publicar" | `bg-brand-accent text-primary hover:opacity-90` |
| Título de seção (Em destaque / Recentes) | `font-display text-heading-2` (DM Serif Display 32px) |
| Input de busca | `bg-elevated border-subtle max-w-xs` |
| Tag de gênero inativo | `bg-elevated border-subtle text-secondary` |
| Tag de gênero ativo | `bg-brand-accent/10 border-brand-accent text-brand-accent` |
| Grid de roteiros | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| Mensagem vazia | `text-muted text-body-small` |

**NavBar:**
- Esquerda: Logo
- Centro: Link "Home", Link "Roteiros"
- Direita: Botão "Publicar" (`bg-brand-accent`, variant `default`) + Avatar/login
- Sticky no topo, altura 64px, `bg-base border-b border-subtle`

**Hero section:**
- Título em DM Serif Display (`font-display text-display`)
- Pode incluir uma palavra em itálico com `font-display italic`
- Subtítulo em Inter body/large (`text-body-large text-secondary`)
- Busca logo abaixo do subtítulo

---

## Passos de execução

### 1. Criar NavBar (components/navbar.tsx)

```typescript
// components/navbar.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-base border-b border-subtle h-16">
      <div className="max-w-[1140px] mx-auto px-5 h-full flex items-center justify-between">
        {/* Logo (ref: 28:56) */}
        <Link href="/" className="font-display text-heading-3 text-primary">
          Antes da Tela
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-secondary hover:text-primary text-body-default transition-colors">
            Home
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/publicar">Publicar</Link>
          </Button>
          {/* Auth: mostrar avatar se logado, link de login se não */}
        </div>
      </div>
    </nav>
  )
}
```

### 2. Atualizar app/page.tsx (Server Component com SSR)

```typescript
// app/page.tsx
import { trpc, HydrateClient } from '@/trpc/server'
import { HomeClient } from './home-client'

export default async function HomePage() {
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

### 3. Criar app/home-client.tsx (Client Component)

```typescript
'use client'

import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { ScriptCard } from '@/components/ui/script-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const GENRES = ['drama', 'thriller', 'comédia', 'ficção científica', 'terror', 'romance', 'documentário', 'animação'] as const

export function HomeClient() {
  const trpc = useTRPC()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState<string | undefined>()
  const debouncedSearch = useDebounce(search, 300)

  const { data: featured } = useQuery(trpc.scripts.listFeatured.queryOptions())

  const { data: recent } = useQuery(
    debouncedSearch || genre
      ? trpc.scripts.search.queryOptions({ query: debouncedSearch || '*', genre: genre as typeof GENRES[number] | undefined })
      : trpc.scripts.listRecent.queryOptions({ limit: 12 })
  )

  return (
    <main className="max-w-[1140px] mx-auto px-5 py-12 flex flex-col gap-16">

      {/* Hero section */}
      <section className="flex flex-col gap-5 py-4">
        <h1 className="font-display text-display text-primary">
          Antes da Tela
        </h1>
        <p className="text-secondary text-body-large max-w-xl">
          Roteiros audiovisuais para ler, comentar e descobrir.
        </p>

        {/* Busca + filtros de gênero */}
        <div className="flex flex-col gap-4 mt-2">
          <Input
            placeholder="Buscar roteiros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGenre(undefined)}
              className={cn(
                'px-3 py-1.5 rounded-full text-body-small border transition-colors',
                !genre
                  ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                  : 'bg-elevated border-subtle text-secondary hover:border-default'
              )}
            >
              Todos
            </button>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(genre === g ? undefined : g)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-body-small border transition-colors capitalize',
                  genre === g
                    ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                    : 'bg-elevated border-subtle text-secondary hover:border-default'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Em destaque */}
      {featured && featured.length > 0 && !debouncedSearch && !genre && (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-heading-2 text-primary">Em destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((script) => (
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
        </section>
      )}

      {/* Roteiros recentes / resultados de busca */}
      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-2 text-primary">
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
          <p className="text-muted text-body-small">
            {debouncedSearch ? 'Nenhum roteiro encontrado.' : 'Ainda não há roteiros publicados.'}
          </p>
        )}
      </section>
    </main>
  )
}
```

### 4. Criar hook useDebounce

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

### 5. Verificar ScriptCard

Verificar `components/ui/script-card.tsx`. Se `rating` e `pages` forem obrigatórios, tornar opcionais com default `0`.

---

## Validação

```bash
yarn build
yarn lint
```

**Verificação (yarn dev):**
- [ ] `view-source:http://localhost:3000` contém os títulos dos roteiros (SSR confirmado)
- [ ] NavBar sticky no topo com logo, link home, botão "Publicar" em brand-accent
- [ ] Hero com DM Serif Display e subtítulo Inter
- [ ] Busca filtra após 300ms sem request por tecla (verificar Network tab)
- [ ] Clicar em filtro de gênero refiltra a grid
- [ ] Tag de gênero ativa em brand-accent, inativa em bg-elevated
- [ ] Seção "Em destaque" aparece apenas para roteiros com `is_featured = true`
- [ ] Grid responsiva: 1 col mobile (375px), 3 cols desktop (1280px)

## Checklist de aceite

- [ ] `app/page.tsx` é Server Component com prefetch via `HydrateClient`
- [ ] NavBar com logo + CTA "Publicar" em brand-accent
- [ ] Roteiros visíveis no source HTML (SSR)
- [ ] Busca com debounce 300ms
- [ ] Filtro de gênero com visual brand-accent quando ativo
- [ ] Títulos de seção em DM Serif Display (`font-display text-heading-2`)
- [ ] Grid responsiva
- [ ] `yarn build` limpo
