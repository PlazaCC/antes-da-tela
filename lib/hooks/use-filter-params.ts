'use client'

import { AGE_RATINGS, GENRES } from '@/lib/constants/scripts'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export type Genre = (typeof GENRES)[number]
export type AgeRating = (typeof AGE_RATINGS)[number]

function parseParam<T extends string>(param: string | null, valid: readonly T[]): T[] {
  if (!param) return []
  return param.split(',').filter((v): v is T => valid.includes(v as T))
}

export function useFilterParams() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const genres = parseParam(searchParams.get('genre'), GENRES)
  const ageRatings = parseParam(searchParams.get('age_rating'), AGE_RATINGS)

  const apply = useCallback(
    (nextGenres: Genre[], nextAgeRatings: AgeRating[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextGenres.length > 0) params.set('genre', nextGenres.join(','))
      else params.delete('genre')
      if (nextAgeRatings.length > 0) params.set('age_rating', nextAgeRatings.join(','))
      else params.delete('age_rating')
      const qs = params.toString()
      router.replace(qs ? `/?${qs}` : '/')
    },
    [searchParams, router],
  )

  const toggleGenre = useCallback(
    (g: Genre) => {
      const next = genres.includes(g) ? genres.filter((x) => x !== g) : [...genres, g]
      apply(next, ageRatings)
    },
    [genres, ageRatings, apply],
  )

  const toggleAgeRating = useCallback(
    (r: AgeRating) => {
      const next = ageRatings.includes(r) ? ageRatings.filter((x) => x !== r) : [...ageRatings, r]
      apply(genres, next)
    },
    [genres, ageRatings, apply],
  )

  const clearFilters = useCallback(() => apply([], []), [apply])

  return { genres, ageRatings, toggleGenre, toggleAgeRating, clearFilters, apply }
}
