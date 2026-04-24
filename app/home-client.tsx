'use client'

import { FilterPanel } from '@/components/filter-panel'
import { ScriptCard } from '@/components/script-card/script-card'
import { ScriptPreviewModal } from '@/components/script-preview-modal'
import { SearchSkeleton } from '@/components/skeletons'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { GENRES } from '@/lib/constants/scripts'
import { useFilterParams } from '@/lib/hooks/use-filter-params'
import { cn, getStorageUrl } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SlidersHorizontalIcon } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function HomeClient() {
  const trpc = useTRPC()
  const searchParams = useSearchParams()
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const { genres, ageRatings, toggleGenre, clearFilters, apply } = useFilterParams()

  const search = searchParams.get('q') ?? ''
  const isSearchActive = !!(search || genres.length > 0 || ageRatings.length > 0)

  const { data: featured } = useQuery(trpc.scripts.listFeatured.queryOptions())

  const {
    data: recentData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...trpc.scripts.listRecent.infiniteQueryOptions(
      { limit: 20 },
      { getNextPageParam: (last) => last.nextCursor ?? undefined },
    ),
    enabled: !isSearchActive,
  })

  const { data: searchData, isFetching: isSearchFetching } = useQuery({
    ...trpc.scripts.search.queryOptions({
      query: search || undefined,
      genres: genres.length > 0 ? genres : undefined,
      ageRatings: ageRatings.length > 0 ? ageRatings : undefined,
    }),
    enabled: isSearchActive,
  })

  const showSearchSkeleton = isSearchActive && !searchData && isSearchFetching
  const displayedScripts = isSearchActive ? (searchData ?? []) : (recentData?.pages.flatMap((p) => p.items) ?? [])

  // Infinite scroll sentinel
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = loaderRef.current
    if (!el || !hasNextPage || isSearchActive) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage, isSearchActive])

  const scriptIds = displayedScripts.map((s) => s.id)
  const { data: ratingsMap } = useQuery({
    ...trpc.ratings.getManyAverage.queryOptions({ scriptIds }),
    enabled: scriptIds.length > 0,
  })

  const { data: trendingBanners, isLoading: isTrendingBannersLoading } = useQuery(
    trpc.scripts.listTrendingBanners.queryOptions(),
  )

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
      {/* Banners em Alta Carousel */}
      {trendingBanners && trendingBanners.length > 0 ? (
        <section className='w-full'>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className='w-full'>
            <CarouselContent>
              {trendingBanners.map((script) => (
                <CarouselItem key={script.id}>
                  <button
                    onClick={() => setPreviewId(script.id)}
                    className='group relative w-full h-[300px] md:h-[552px] overflow-hidden bg-bg-elevated transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent'>
                    {script.banner_path ? (
                      <Image
                        src={getStorageUrl('avatars', script.banner_path)!}
                        alt={script.title}
                        fill
                        priority
                        className='object-cover transition-transform duration-700 group-hover:scale-105'
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full opacity-10'>
                        <span className='font-mono text-heading-1 uppercase tracking-[0.3em] rotate-[-2deg]'>
                          {script.title}
                        </span>
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className='absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/20 to-transparent' />

                    {/* Content */}
                    <div className='absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col items-start text-left max-w-screen-xl mx-auto w-full'>
                      <span className='font-mono text-body-small md:text-body-default text-brand-accent uppercase tracking-[0.2em] mb-2 md:mb-4'>
                        {script.genre}
                      </span>
                      <h2 className='font-display text-heading-2 md:text-[64px] text-text-primary leading-[1.1] mb-2 md:mb-4 max-w-3xl'>
                        {script.title}
                      </h2>
                      <p className='text-body-small md:text-body-large text-text-secondary line-clamp-2 max-w-xl'>
                        {script.logline || 'Um roteiro original em destaque na plataforma.'}
                      </p>
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className='absolute bottom-6 right-12 hidden md:flex gap-2'>
              <CarouselPrevious className='static translate-y-0 h-10 w-10 border-border-subtle bg-bg-elevated/40 text-text-primary hover:bg-bg-elevated/60 hover:text-text-primary' />
              <CarouselNext className='static translate-y-0 h-10 w-10 border-border-subtle bg-bg-elevated/40 text-text-primary hover:bg-bg-elevated/60 hover:text-text-primary' />
            </div>
          </Carousel>
        </section>
      ) : isTrendingBannersLoading ? (
        <Skeleton className='h-[300px] md:h-[552px]  w-full' />
      ) : null}

      <div className='w-full px-4 flex flex-col gap-8 md:gap-12 pb-16 pt-8'>
        {/* Hero headline (Commented out as requested) */}
        {/*
        <div className='flex flex-col gap-2 md:gap-3'>
          <h1 className='font-display text-heading-2 md:text-heading-1 text-text-primary leading-[1.1]'>
            Roteiros que <span className='text-brand-accent italic'>merecem</span> ser lidos.
          </h1>
          <p className='text-body-default md:text-body-large text-text-secondary max-w-xl'>
            Plataforma de publicação, leitura e discussão de roteiros audiovisuais.
          </p>
        </div>
        */}

        {/* Genre filter pills + filter trigger */}
        <div
          className='flex items-center gap-1.5 md:gap-2 py-2 overflow-x-auto md:flex-wrap md:overflow-hidden pb-1 md:pb-0 snap-x snap-mandatory'
          role='group'
          aria-label='Filtrar por gênero'>
          <button
            onClick={() => setFilterOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 font-mono font-medium text-[11px] md:text-body-small border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base shrink-0 snap-start',
              genres.length > 0 || ageRatings.length > 0
                ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                : 'bg-bg-base border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary',
            )}>
            <SlidersHorizontalIcon className='w-3 h-3 md:w-3.5 md:h-3.5' />
            Filtrar
          </button>

          <button
            onClick={() => apply([], ageRatings)}
            aria-pressed={genres.length === 0}
            className={cn(
              'px-2.5 md:px-3 py-1 md:py-1.5 text-[11px] md:text-body-small border font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base shrink-0 snap-start',
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
                'px-2.5 md:px-3 py-1 md:py-1.5 text-[11px] md:text-body-small border font-mono font-medium transition-colors capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base shrink-0 snap-start',
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
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8'>
              {featured.map((script) => (
                <ScriptCard
                  key={script.id}
                  title={script.title}
                  author={script.author?.name ?? ''}
                  genre={script.genre ?? ''}
                  rating={ratingsMap?.[script.id]?.average ?? null}
                  ratingTotal={ratingsMap?.[script.id]?.total ?? 0}
                  pages={script.script_files?.[0]?.page_count ?? null}
                  coverUrl={getStorageUrl('avatars', script.cover_path)}
                  onPreview={() => setPreviewId(script.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Resultados - only show title when search is active */}
        {showSearchSkeleton ? (
          <SearchSkeleton />
        ) : (
          <section className='flex flex-col gap-5'>
            {isSearchActive && <h2 className='font-display text-heading-2 text-text-primary'>Resultados</h2>}
            {displayedScripts.length > 0 ? (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8'>
                {displayedScripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    title={script.title}
                    author={script.author?.name ?? ''}
                    genre={script.genre ?? ''}
                    rating={ratingsMap?.[script.id]?.average ?? null}
                    ratingTotal={ratingsMap?.[script.id]?.total ?? 0}
                    pages={script.script_files?.[0]?.page_count ?? null}
                    coverUrl={getStorageUrl('avatars', script.cover_path)}
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
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loaderRef} className='py-6 flex justify-center'>
          {isFetchingNextPage && (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 w-full'>
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className='aspect-[4/5] bg-elevated rounded-sm' />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
