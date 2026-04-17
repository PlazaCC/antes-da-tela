'use client'

import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { ScriptCard } from '@/components/ui/script-card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GENRES } from '@/lib/constants/scripts'

export function HomeClient() {
  const trpc = useTRPC()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState<(typeof GENRES)[number] | undefined>()
  const debouncedSearch = useDebounce(search, 300)

  const isSearchActive = !!(debouncedSearch || genre)

  const { data: featured } = useQuery(trpc.scripts.listFeatured.queryOptions())

  const { data: recentData } = useQuery({
    ...trpc.scripts.listRecent.queryOptions({ limit: 12 }),
    enabled: !isSearchActive,
  })

  const { data: searchData } = useQuery({
    ...trpc.scripts.search.queryOptions({
      query: debouncedSearch || undefined,
      genre,
    }),
    enabled: isSearchActive,
  })

  const displayedScripts = isSearchActive ? (searchData ?? []) : (recentData?.items ?? [])

  return (
    <main className="max-w-[1140px] mx-auto px-5 py-12 flex flex-col gap-16">

      {/* Hero section */}
      <section className="flex flex-col gap-5 py-4">
        <h1 className="font-display text-display text-text-primary">
          Roteiros que{' '}
          <span className="text-brand-accent italic">merecem</span>
          <br />
          ser lidos.
        </h1>
        <p className="text-text-secondary text-body-large max-w-xl">
          Plataforma de publicação, leitura e discussão de roteiros audiovisuais.
        </p>

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
                  : 'bg-elevated border-border-subtle text-text-secondary hover:border-border-default',
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
                    : 'bg-elevated border-border-subtle text-text-secondary hover:border-border-default',
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Em destaque */}
      {featured && featured.length > 0 && !isSearchActive && (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-heading-2 text-text-primary">Em destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((script) => (
              <ScriptCard
                key={script.id}
                href={`/scripts/${script.id}`}
                title={script.title}
                author={script.author?.name ?? ''}
                genre={script.genre ?? ''}
                rating={null}
                pages={script.script_files?.[0]?.page_count ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Roteiros recentes / resultados */}
      <section className="flex flex-col gap-5">
        <h2 className="font-display text-heading-2 text-text-primary">
          {isSearchActive ? 'Resultados' : 'Roteiros recentes'}
        </h2>
        {displayedScripts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedScripts.map((script) => (
              <ScriptCard
                key={script.id}
                href={`/scripts/${script.id}`}
                title={script.title}
                author={script.author?.name ?? ''}
                genre={script.genre ?? ''}
                rating={null}
                pages={script.script_files?.[0]?.page_count ?? null}
              />
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-body-small">
            {isSearchActive ? 'Nenhum roteiro encontrado.' : 'Ainda não há roteiros publicados.'}
          </p>
        )}
      </section>
    </main>
  )
}
