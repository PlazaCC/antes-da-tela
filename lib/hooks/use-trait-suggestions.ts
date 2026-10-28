'use client'

import { SUGGESTED_CHARACTER_TRAITS } from '@/lib/constants/scripts'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useTRPC } from '@/trpc/client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

const MAX_VISIBLE = 8

export const normalizeTrait = (value: string) => value.trim().toLocaleLowerCase('pt-BR')

/**
 * LinkedIn-skills style suggestions: traits other authors already use (most
 * used first), topped up with a starter vocabulary, minus the ones picked.
 */
export function useTraitSuggestions(query: string, selected: string[]) {
  const trpc = useTRPC()
  const debouncedQuery = useDebounce(query.trim(), 250)

  const { data } = useQuery({
    ...trpc.characters.suggestTraits.queryOptions({ query: debouncedQuery, limit: MAX_VISIBLE }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })

  return useMemo(() => {
    const needle = normalizeTrait(query)
    const taken = new Set(selected.map(normalizeTrait))
    const seen = new Set<string>()
    const suggestions: { trait: string; uses: number }[] = []

    const push = (trait: string, uses: number) => {
      const key = normalizeTrait(trait)
      if (taken.has(key) || seen.has(key)) return
      if (needle && !key.includes(needle)) return
      seen.add(key)
      suggestions.push({ trait, uses })
    }

    for (const item of data ?? []) push(item.trait, item.uses)
    for (const trait of SUGGESTED_CHARACTER_TRAITS) push(trait, 0)

    return suggestions.slice(0, MAX_VISIBLE)
  }, [data, query, selected])
}
