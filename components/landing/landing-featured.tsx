'use client'

import Link from 'next/link'
import { useMemo, useRef } from 'react'

import { getStorageUrl } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

import 'swiper/css'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import {
  CARD_COLORS,
  CARD_PATTERNS,
  FeaturedCard,
  hashStringToIndex,
} from './landing-featured-card'
import { LandingSection } from './landing-section'

export function LandingFeatured() {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const trpc = useTRPC()
  const { data: recent } = useQuery(
    trpc.scripts.listRecent.queryOptions({ limit: 7 })
  )

  const scripts = useMemo(() => recent?.items ?? [], [recent?.items])
  const scriptIds = useMemo(() => scripts.map((s) => s.id), [scripts])

  const { data: ratingsMap } = useQuery({
    ...trpc.ratings.getManyAverage.queryOptions({ scriptIds }),
    enabled: scriptIds.length > 0,
  })

  const slides = useMemo(() => {
    const items = scripts.map((s) => {
      const indexForStyle = hashStringToIndex(
        `${s.id}${s.genre ?? ''}`,
        CARD_COLORS.length
      )
      const patternIndex = hashStringToIndex(
        `${s.genre ?? ''}${s.title ?? ''}`,
        CARD_PATTERNS.length
      )
      const coverUrl = getStorageUrl('avatars', s.cover_path) ?? null

      return (
        <SwiperSlide key={s.id} className="!w-[280px]">
          <FeaturedCard
            id={s.id}
            genre={s.genre ?? 'Roteiro'}
            title={s.title}
            author={s.author?.name ?? 'Autor'}
            rating={ratingsMap?.[s.id]?.average ?? null}
            coverUrl={coverUrl}
            color={CARD_COLORS[indexForStyle]!}
            pattern={CARD_PATTERNS[patternIndex]!}
          />
        </SwiperSlide>
      )
    })

    items.push(
      <SwiperSlide key="ver-tudo" className="flex !w-[180px] items-center">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2.5 border-b border-[var(--land-border)] pb-1.5 font-display text-[24px] text-[var(--land-fg)] no-underline transition-[color_0.2s_ease,border-color_0.2s_ease] hover:border-brand-accent hover:text-brand-accent"
        >
          Ver tudo{' '}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            width={20}
            height={20}
          >
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" />
          </svg>
        </Link>
      </SwiperSlide>
    )

    return items
  }, [scripts, ratingsMap])

  const navButtonClass =
    'swiper-nav flex h-12 w-12 items-center justify-center rounded-full border border-[var(--land-border-strong)] bg-transparent text-[var(--land-fg)] transition-[background_0.2s_ease,border-color_0.2s_ease,color_0.2s_ease,transform_0.2s_ease] hover:-translate-y-[2px] hover:border-brand-accent hover:bg-brand-accent hover:text-white'

  return (
    <LandingSection
      id="roteiros"
      tone="cream"
      className="py-[clamp(80px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 px-[clamp(24px,6vw,80px)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2
              className="land-reveal m-0 font-display text-[clamp(36px,5.4vw,80px)] leading-[0.98] text-[var(--land-fg)]"
              data-delay="1"
            >
              Roteiros que estão
              <br />
              <span className="text-brand-accent">ganhando vida agora.</span>
            </h2>
            <div className="land-reveal flex gap-2" data-delay="2">
              <button
                ref={prevRef}
                aria-label="Anterior"
                className={`${navButtonClass} swiper-nav-prev`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  width={20}
                  height={20}
                >
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" />
                </svg>
              </button>
              <button
                ref={nextRef}
                aria-label="Próximo"
                className={`${navButtonClass} swiper-nav-next`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  width={20}
                  height={20}
                >
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[80px] overflow-visible bg-[linear-gradient(to_right,transparent,var(--land-bg))]" />
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onInit={(swiper) => {
              if (
                swiper.params.navigation &&
                typeof swiper.params.navigation !== 'boolean'
              ) {
                swiper.params.navigation.prevEl = prevRef.current
                swiper.params.navigation.nextEl = nextRef.current
                swiper.navigation.init()
                swiper.navigation.update()
              }
            }}
            slidesPerView="auto"
            spaceBetween={20}
            grabCursor
            className="!px-[clamp(24px,6vw,80px)] !py-3"
          >
            {slides}
          </Swiper>
        </div>
      </div>
    </LandingSection>
  )
}
