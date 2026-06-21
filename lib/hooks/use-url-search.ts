'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function useUrlSearch(debounceMs = 400) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchParams])

  const onChange = (next: string) => {
    setValue(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (next) params.set('q', next)
      const genre = searchParams.get('genre')
      if (genre) params.set('genre', genre)
      const query = params.toString()
      // Search results live on the feed, not on the landing root.
      const target = query ? `/feed?${query}` : '/feed'
      if (pathname === '/feed') {
        router.replace(target)
      } else {
        router.push(target)
      }
    }, debounceMs)
  }

  return { value, onChange }
}
