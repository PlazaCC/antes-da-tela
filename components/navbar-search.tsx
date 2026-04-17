'use client'

import { Input } from '@/components/ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function NavBarSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync input if URL changes externally
  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleChange = (next: string) => {
    setValue(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (next) params.set('q', next)
      const genre = searchParams.get('genre')
      if (genre) params.set('genre', genre)
      const target = `/?${params.toString()}`
      if (pathname === '/') {
        router.replace(target)
      } else {
        router.push(target)
      }
    }, 400)
  }

  return (
    <Input
      type='search'
      placeholder='Buscar roteiros...'
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className='h-8 text-sm bg-elevated border-border-subtle placeholder:text-text-muted focus-visible:ring-brand-accent'
    />
  )
}
