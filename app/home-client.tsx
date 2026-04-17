'use client'

import { ScriptPreviewModal } from '@/components/script-preview-modal'
import { ScriptCard } from '@/components/ui/script-card'
import { GENRES } from '@/lib/constants/scripts'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export function HomeClient() {
  const trpc = useTRPC()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [previewId, setPreviewId] = useState<string | null>(null)

  const search = searchParams.get('q') ?? ''
  const genre = (searchParams.get('genre') ?? undefined) as (typeof GENRES)[number] | undefined

  const isSearchActive = !!(search || genre)

  const setGenre = useCallback(
    (next: (typeof GENRES)[number] | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next) {
        params.set('genre', next)
      } else {
        params.delete('genre')
      }
      router.replace(`/?${params.toString()}`)
    },
    [router, searchParams],
  )

  const { data: featured } = useQuery(trpc.scripts.listFeatured.queryOptions())

  const { data: recentData } = useQuery({
    ...trpc.scripts.listRecent.queryOptions({ limit: 12 }),
    enabled: !isSearchActive,
  })

  const { data: searchData } = useQuery({
    ...trpc.scripts.search.queryOptions({
      query: search || undefined,
      genre,
    }),
    enabled: isSearchActive,
  })

  const displayedScripts = isSearchActive ? (searchData ?? []) : (recentData?.items ?? [])

  return (
    <main className='max-w-[1140px] mx-auto px-5 pt-8 pb-16 flex flex-col gap-12'>
      <ScriptPreviewModal
        scriptId={previewId}
        open={!!previewId}
        onOpenChange={(open) => { if (!open) setPreviewId(null) }}
      />

      {/* Hero headline */}
      <div className='flex flex-col gap-3'>
        <h1 className='font-display text-heading-1 text-text-primary'>
          Roteiros que <span className='text-brand-accent italic'>merecem</span> ser lidos.
        </h1>
        <p className='text-body-large text-text-secondary max-w-xl'>
          Plataforma de publicação, leitura e discussão de roteiros audiovisuais.
        </p>
      </div>

      {/* Genre filter pills */}
      <div className='flex gap-2 flex-wrap' role='group' aria-label='Filtrar por gênero'>
        <button
          onClick={() => setGenre(undefined)}
          aria-pressed={!genre}
          className={cn(
            'px-3 py-1.5 rounded-full text-body-small border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
            !genre
              ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
              : 'bg-elevated border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary',
          )}
        >
          Todos
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(genre === g ? undefined : g)}
            aria-pressed={genre === g}
            className={cn(
              'px-3 py-1.5 rounded-full text-body-small border transition-colors capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
              genre === g
                ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                : 'bg-elevated border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary',
            )}
          >
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
                rating={null}
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
                rating={null}
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
                onClick={() => setGenre(undefined)}
                className='text-brand-accent text-body-small hover:underline underline-offset-4 w-fit'
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
