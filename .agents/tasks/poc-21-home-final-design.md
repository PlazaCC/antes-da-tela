# poc-21 — Home: infinite scroll

**Scope:** Frontend + Backend  
**Priority:** P1  
**Status:** pending  
**Figma:** Home `51:562`

---

## O que já está feito ✓

- ScriptCard com `coverUrl` (placeholder `aspect-[4/5]` + imagem) ✓
- Carousel de trending banners (full-width, gradiente, editorial) ✓
- Seção "Em Destaque" com ScriptCards ✓
- Genre chips + FilterPanel + SearchSheet integrados ✓

---

## Gaps

### 1. Remover título "Roteiros recentes"

O `<h2>Roteiros recentes</h2>` deve ser removido da seção de listagem padrão. Os cards aparecem sem título de seção quando não há busca ativa. Quando busca está ativa, manter "Resultados".

**Arquivo:** `app/home-client.tsx`

```tsx
{/* Remover: */}
{isSearchActive ? 'Resultados' : 'Roteiros recentes'}

{/* Manter apenas quando busca ativa: */}
{isSearchActive && <h2 ...>Resultados</h2>}
```

### 2. Infinite scroll para a grid de roteiros

Substituir `listRecent({ limit: 12 })` + `useQuery` por `useInfiniteQuery` com paginação por cursor.

**Backend (`server/api/scripts.ts`):**

Adicionar `cursor` opcional ao `listRecent`:
```ts
listRecent: publicProcedure
  .input(z.object({ limit: z.number().default(20), cursor: z.string().optional() }))
  .query(async ({ ctx, input }) => {
    // query com .range() ou .gt('created_at', cursor)
    // retornar { items, nextCursor }
  })
```

**Frontend (`app/home-client.tsx`):**

```ts
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  ...trpc.scripts.listRecent.infiniteQueryOptions(
    { limit: 20 },
    { getNextPageParam: (last) => last.nextCursor ?? undefined }
  ),
  enabled: !isSearchActive,
})

const displayedScripts = isSearchActive
  ? (searchData ?? [])
  : (data?.pages.flatMap((p) => p.items) ?? [])
```

**Sentinela de scroll:** usar `IntersectionObserver` nativo (sem lib extra):

```tsx
const loaderRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const el = loaderRef.current
  if (!el) return
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage() },
    { threshold: 0.1 }
  )
  observer.observe(el)
  return () => observer.disconnect()
}, [hasNextPage, fetchNextPage])

// No JSX, após a grid:
<div ref={loaderRef} className="py-6 flex justify-center">
  {isFetchingNextPage && (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] bg-elevated rounded-sm" />
      ))}
    </div>
  )}
</div>
```

> Se a lógica do IntersectionObserver ficar muito verbosa no componente, extrair para um hook `useInfiniteScroll(ref, callback)`.

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

O Figma cobre apenas 1440px. A Home já tem layout responsivo aprovado mas precisa garantir esses pontos ao implementar o infinite scroll.

### Carousel — sem setas no mobile

Em telas < 768px, os botões de navegação do carousel (Prev/Next) devem ficar ocultos — o usuário navega por swipe nativo (Embla já suporta). Exibir setas apenas em `md:flex`:

```tsx
<button className="hidden md:flex ...prev-btn...">
<button className="hidden md:flex ...next-btn...">
```

### Genre chips — scroll horizontal no mobile

Os chips de gênero não devem quebrar linha no mobile. Usar scroll horizontal:

```tsx
<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
  {genres.map(g => (
    <button className="shrink-0 snap-start ...">
```

Garantir que nenhum chip seja cortado na borda direita sem indicação de scroll.

### Grid de roteiros — colunas responsivas

A grid de ScriptCards deve usar:

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
```

No phone (2 colunas), os cards ficam mais estreitos — garantir que o cover `aspect-[4/5]` não quebre e que o título truncate com 1–2 linhas.

### Skeleton de carregamento — colunas correspondentes

O skeleton ao buscar próxima página deve ter o mesmo número de colunas que a grid real, senão haverá layout shift:

```tsx
{isFetchingNextPage && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 w-full">
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton key={i} className="aspect-[4/5] bg-elevated rounded-sm" />
    ))}
  </div>
)}
```

10 skeletons cobrem 2 linhas em qualquer coluna (2, 3, 4 ou 5 cols).

### Touch targets — ScriptCard

Cada ScriptCard deve ser naturalmente clicável pela área completa da imagem + título. Garantir que o `<Link>` envolva o card inteiro e não apenas o texto.

---

## Acceptance criteria

- [ ] Título "Roteiros recentes" removido quando não há busca ativa
- [ ] Grid carrega automaticamente mais roteiros ao rolar até o fim
- [ ] `hasNextPage: false` → sentinela some, sem loader infinito
- [ ] Quando busca ativa: grid de resultados (sem paginação, comportamento atual mantido)
- [ ] Phone: grid com 2 colunas (`grid-cols-2`)
- [ ] Tablet: grid com 3 colunas (`md:grid-cols-3`)
- [ ] Desktop: grid com 4–5 colunas (`lg:grid-cols-4 xl:grid-cols-5`)
- [ ] Skeleton de next-page com mesmas colunas que a grid
- [ ] Carousel: setas de navegação ocultas no mobile (`hidden md:flex`)
- [ ] Genre chips: scroll horizontal no mobile, sem quebra de linha
- [ ] `yarn build` sem erros de tipo
