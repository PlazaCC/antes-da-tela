'use client'

import { FilterPanel } from '@/components/filter-panel'
import { ScriptCard } from '@/components/script-card/script-card'
import { ScriptPreviewModal } from '@/components/script-preview-modal'
import { SearchSkeleton } from '@/components/skeletons'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { MACRO_GENRES } from '@/lib/constants/scripts'
import { useFilterParams, type Genre } from '@/lib/hooks/use-filter-params'
import { cn, getStorageUrl } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SlidersHorizontalIcon } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { useEffect, useRef, useState } from 'react'

export function FeedClient() {
  const trpc = useTRPC()
  const searchParams = useSearchParams()
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const { genres, ageRatings, toggleGenre, clearFilters, apply } =
    useFilterParams()

  const handlePreviewOpen = (scriptId: string) => {
    setPreviewId(scriptId)
    posthog.capture('script_preview_opened', { script_id: scriptId })
  }

  const handleGenreFilter = (genre: Genre) => {
    toggleGenre(genre)
    posthog.capture('feed_genre_filtered', { genre, is_active: !genres.includes(genre) })
  }

  const search = searchParams.get('q') ?? ''
  const isSearchActive = !!(
    search ||
    genres.length > 0 ||
    ageRatings.length > 0
  )

  const { data: featured } = useQuery(trpc.scripts.listFeatured.queryOptions())

  const {
    data: recentData,
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

  const { data: searchData, isFetching: isSearchFetching } = useQuery({
    ...trpc.scripts.search.queryOptions({
      query: search || undefined,
      genres: genres.length > 0 ? genres : undefined,
      ageRatings: ageRatings.length > 0 ? ageRatings : undefined,
    }),
    enabled: isSearchActive,
  })

  const showSearchSkeleton = isSearchActive && !searchData && isSearchFetching
  const displayedScripts = isSearchActive
    ? (searchData ?? [])
    : (recentData?.pages.flatMap((p) => p.items) ?? [])

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
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage, isSearchActive])

  const scriptIds = displayedScripts.map((s) => s.id)
  const { data: ratingsMap } = useQuery({
    ...trpc.ratings.getManyAverage.queryOptions({ scriptIds }),
    enabled: scriptIds.length > 0,
  })

  const { data: trendingBanners, isLoading: isTrendingBannersLoading } =
    useQuery(trpc.scripts.listTrendingBanners.queryOptions())

  return (
    <main className="mx-auto w-full">
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
        <section className="w-full">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {trendingBanners.map((script) => (
                <CarouselItem key={script.id}>
                  <button
                    onClick={() => setPreviewId(script.id)}
                    className="bg-bg-elevated group relative h-[300px] w-full overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:h-[552px]"
                  >
                    {(() => {
                      const bannerUrl = script.banner_path
                        ? getStorageUrl('avatars', script.banner_path)
                        : null
                      if (!bannerUrl) {
                        return (
                          <div className="flex h-full items-center justify-center opacity-10">
                            <span className="rotate-[-2deg] font-mono text-heading-1 uppercase tracking-[0.3em]">
                              {script.title}
                            </span>
                          </div>
                        )
                      }
                      return (
                        <Image
                          src={bannerUrl}
                          alt={script.title}
                          fill
                          priority
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )
                    })()}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/20 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 mx-auto flex w-full max-w-screen-xl flex-col items-start p-6 text-left md:p-12">
                      <span className="mb-2 font-mono text-body-small uppercase tracking-[0.2em] text-brand-accent md:text-body-default">
                        {script.genre}
                      </span>
                      <h2 className="mb-2 max-w-3xl font-display text-heading-2 leading-[1.1] text-text-primary md:mb-4 md:text-[64px]">
                        {script.title}
                      </h2>
                      <p className="line-clamp-2 max-w-xl text-body-small text-text-secondary md:text-body-large">
                        {script.logline ||
                          'Um roteiro original em destaque na plataforma.'}
                      </p>
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute bottom-6 right-12 hidden gap-2 md:flex">
              <CarouselPrevious className="bg-bg-elevated/40 hover:bg-bg-elevated/60 static h-10 w-10 translate-y-0 border-border-subtle text-text-primary hover:text-text-primary" />
              <CarouselNext className="bg-bg-elevated/40 hover:bg-bg-elevated/60 static h-10 w-10 translate-y-0 border-border-subtle text-text-primary hover:text-text-primary" />
            </div>
          </Carousel>
        </section>
      ) : isTrendingBannersLoading ? (
        <Skeleton className="h-[300px] w-full md:h-[552px]" />
      ) : null}

      <div className="flex w-full flex-col gap-8 px-4 pb-16 pt-8 md:gap-12">
        {/* Genre filter pills + filter trigger */}
        <div
          className="flex snap-x snap-mandatory items-center gap-1.5 overflow-x-auto py-2 pb-1 [scrollbar-width:none] md:flex-wrap md:gap-2 md:overflow-hidden md:pb-0 [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Filtrar por gênero"
        >
          <button
            onClick={() => setFilterOpen(true)}
            className={cn(
              'flex shrink-0 snap-start items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base md:px-3 md:py-1.5 md:text-body-small',
              genres.length > 0 || ageRatings.length > 0
                ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                : 'border-border-subtle bg-bg-base text-text-secondary hover:border-border-default hover:text-text-primary'
            )}
          >
            <SlidersHorizontalIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Filtrar
          </button>

          <button
            onClick={() => apply([], ageRatings)}
            aria-pressed={genres.length === 0}
            className={cn(
              'shrink-0 snap-start border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base md:px-3 md:py-1.5 md:text-body-small',
              genres.length === 0
                ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                : 'border-border-subtle bg-bg-base text-text-secondary hover:border-border-default hover:text-text-primary'
            )}
          >
            Todos
          </button>

          {MACRO_GENRES.map((g) => (
            <button
              key={g}
              onClick={() => handleGenreFilter(g)}
              aria-pressed={genres.includes(g)}
              className={cn(
                'shrink-0 snap-start border px-2.5 py-1 font-mono text-[11px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base md:px-3 md:py-1.5 md:text-body-small',
                genres.includes(g)
                  ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                  : 'border-border-subtle bg-bg-base text-text-secondary hover:border-border-default hover:text-text-primary'
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Em destaque */}
        {featured && featured.length > 0 && !isSearchActive && (
          <section className="flex flex-col gap-5">
            <h2 className="font-display text-heading-2 text-text-primary">
              Em destaque
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5">
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
                  onPreview={() => handlePreviewOpen(script.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Resultados - only show title when search is active */}
        {showSearchSkeleton ? (
          <SearchSkeleton />
        ) : (
          <section className="flex flex-col gap-5">
            {isSearchActive && (
              <h2 className="font-display text-heading-2 text-text-primary">
                Resultados
              </h2>
            )}
            {displayedScripts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5">
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
                    onPreview={() => handlePreviewOpen(script.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-8">
                <p className="text-body-default text-text-secondary">
                  {isSearchActive
                    ? 'Nenhum roteiro encontrado.'
                    : 'Ainda não há roteiros publicados.'}
                </p>
                {isSearchActive && (
                  <button
                    onClick={clearFilters}
                    className="w-fit text-body-small text-brand-accent underline-offset-4 hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loaderRef} className="flex justify-center py-6">
          {isFetchingNextPage && (
            <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[4/5] rounded-sm bg-elevated"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
