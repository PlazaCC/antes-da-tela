# poc-06-home — Archived

**Original title:** [Home] - Listagem de roteiros e descoberta

## What was done
`HomeClient` (`app/home-client.tsx`) is a client component with genre filter, search via URL params, and SSR prefetch of `listRecent` + `listFeatured` via `HydrateClient` in `app/page.tsx`. `NavBarSearch` component uses 300ms debounce via ref for search. `useDebounce` hook at `lib/hooks/use-debounce.ts`. Genre filter chips refilter grid without reload. Featured section renders scripts with `is_featured=true`. `ScriptCard` is responsive (1 col mobile, 3 col desktop). SSR confirmed via prefetch in Server Component.

## Relevant paths
- `app/home-client.tsx`
- `app/page.tsx`
- `components/navbar-search.tsx`
- `lib/hooks/use-debounce.ts`
- `components/ui/script-card.tsx`
- `lib/constants/scripts.ts`
