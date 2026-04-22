'use client'

import { Input } from '@/components/ui/input'
import { useUrlSearch } from '@/lib/hooks/use-url-search'

export function NavBarSearch() {
  const { value, onChange } = useUrlSearch()

  return (
    <Input
      type='search'
      placeholder='Buscar roteiros...'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='h-8 text-sm bg-elevated border-border-subtle placeholder:text-text-muted focus-visible:ring-brand-accent'
    />
  )
}
