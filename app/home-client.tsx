'use client'

import { FilterPanel } from '@/components/filter-panel'
import { ScriptPreviewModal } from '@/components/script-preview-modal'
import { ScriptCard } from '@/components/ui/script-card'
import { GENRES } from '@/lib/constants/scripts'
import { useFilterParams } from '@/lib/hooks/use-filter-params'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontalIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function HomeClient() {
  const trpc = useTRPC()
  const searchParams = useSearchParams()
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const { genres, ageRatings, toggleGenre, clearFilters, apply } = useFilterParams()

  const search = searchParams.get('q') ?? ''
  const isSearchActive = !!(search || genres.length > 0 || ageRatings.length > 0)

  const { data: featured } = useQuery(trpc.scripts.listFeatured.queryOptions())

  const { data: recentData } = useQuery({
    ...trpc.scripts.listRecent.queryOptions({ limit: 12 }),
    enabled: !isSearchActive,
  })

  const { data: searchData } = useQuery({
    ...trpc.scripts.search.queryOptions({
      query: search || undefined,
      genres: genres.length > 0 ? genres : undefined,
      ageRatings: ageRatings.length > 0 ? ageRatings : undefined,
    }),
    enabled: isSearchActive,
  })

  const displayedScripts = isSearchActive ? (searchData ?? []) : (recentData?.items ?? [])

  const scriptIds = displayedScripts.map((s) => s.id)
  const { data: ratingsMap } = useQuery({
    ...trpc.ratings.getManyAverage.queryOptions({ scriptIds }),
    enabled: scriptIds.length > 0,
  })

  return (
    <main className='w-full mx-auto'>
      <ScriptPreviewModal
        scriptId={previewId}
        open={!!previewId}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null)
        }}
      />
      <FilterPanel open={filterOpen} onOpenChange={setFilterOpen} />
      <div className='w-full px-4 flex flex-col gap-12 pt-8 pb-16'>
        {/* Hero headline */}
        <div className='flex flex-col gap-3'>
          <h1 className='font-display text-heading-1 text-text-primary'>
            Roteiros que <span className='text-brand-accent italic'>merecem</span> ser lidos.
          </h1>
          <p className='text-body-large text-text-secondary max-w-xl'>
            Plataforma de publicação, leitura e discussão de roteiros audiovisuais.
          </p>
        </div>

        {/* Genre filter pills + filter trigger */}
        <div
          className='flex items-center gap-2 px-8 md:px-20 py-4 flex-wrap'
          role='group'
          aria-label='Filtrar por gênero'>
          <button
            onClick={() => setFilterOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 font-mono font-medium text-body-small border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
              genres.length > 0 || ageRatings.length > 0
                ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                : 'bg-bg-base border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary',
            )}>
            <SlidersHorizontalIcon className='w-3.5 h-3.5' />
            Filtrar
          </button>

          <button
            onClick={() => apply([], ageRatings)}
            aria-pressed={genres.length === 0}
            className={cn(
              'px-3 py-1.5 text-body-small border font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
              genres.length === 0
                ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                : 'bg-bg-base border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary',
            )}>
            Todos
          </button>

          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              aria-pressed={genres.includes(g)}
              className={cn(
                'px-3 py-1.5 text-body-small border font-mono font-medium transition-colors capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
                genres.includes(g)
                  ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                  : 'bg-bg-base border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary',
              )}>
              {g}
            </button>
          ))}
        </div>

        {/* Em destaque */}
        {featured && featured.length > 0 && !isSearchActive && (
          <section className='flex flex-col gap-5'>
            <h2 className='font-display text-heading-2 text-text-primary'>Em destaque</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {featured.map((script) => (
                <ScriptCard
                  key={script.id}
                  title={script.title}
                  author={script.author?.name ?? ''}
                  genre={script.genre ?? ''}
                  rating={ratingsMap?.[script.id]?.average ?? null}
                  ratingTotal={ratingsMap?.[script.id]?.total ?? 0}
                  pages={script.script_files?.[0]?.page_count ?? null}
                  onPreview={() => setPreviewId(script.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Roteiros recentes / resultados */}
        <section className='flex flex-col gap-5'>
          <h2 className='font-display text-heading-2 text-text-primary'>
            {isSearchActive ? 'Resultados' : 'Roteiros recentes'}
          </h2>
          {displayedScripts.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {displayedScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  title={script.title}
                  author={script.author?.name ?? ''}
                  genre={script.genre ?? ''}
                  rating={ratingsMap?.[script.id]?.average ?? null}
                  ratingTotal={ratingsMap?.[script.id]?.total ?? 0}
                  pages={script.script_files?.[0]?.page_count ?? null}
                  onPreview={() => setPreviewId(script.id)}
                />
              ))}
            </div>
          ) : (
            <div className='flex flex-col gap-2 py-8'>
              <p className='text-text-secondary text-body-default'>
                {isSearchActive ? 'Nenhum roteiro encontrado.' : 'Ainda não há roteiros publicados.'}
              </p>
              {isSearchActive && (
                <button
                  onClick={clearFilters}
                  className='text-brand-accent text-body-small hover:underline underline-offset-4 w-fit'>
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
