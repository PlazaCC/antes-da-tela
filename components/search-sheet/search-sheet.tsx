'use client'

import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface SearchSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const trpc = useTRPC()
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setInputValue('')
      setDebouncedQuery('')
    }
  }, [open])

  const handleChange = (value: string) => {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300)
  }

  // Strip chars rejected by the search endpoint's regex
  const safeQuery = debouncedQuery.replace(/[%,().]/g, '').trim()

  const { data: results } = useQuery({
    ...trpc.scripts.search.queryOptions({ query: safeQuery || undefined }),
    enabled: open && safeQuery.length > 1,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='bottom'
        className='p-0 gap-0 flex flex-col h-[80vh] bg-surface border-border-subtle'>
        <SheetTitle className='sr-only'>Buscar roteiros</SheetTitle>

        {/* Search input */}
        <div className='px-5 py-4 border-b border-border-subtle shrink-0'>
          <Input
            type='search'
            autoFocus
            placeholder='Busca'
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            className='h-8 text-sm bg-elevated border-border-subtle placeholder:text-text-muted focus-visible:ring-brand-accent'
          />
        </div>

        {/* Results */}
        <div className='flex-1 overflow-y-auto'>
          {results && results.length > 0 ? (
            results.map((script) => (
              <Link
                key={script.id}
                href={`/scripts/${script.id}`}
                onClick={() => onOpenChange(false)}
                className='flex flex-col px-5 py-3 border-b border-border-subtle hover:bg-elevated transition-colors'>
                <span className='text-sm text-text-primary'>{script.title}</span>
                {script.author?.name && (
                  <span className='text-xs text-text-muted'>{script.author.name}</span>
                )}
              </Link>
            ))
          ) : safeQuery.length > 1 ? (
            <p className='px-5 py-4 text-sm text-text-muted'>Nenhum roteiro encontrado.</p>
          ) : (
            <p className='px-5 py-4 text-sm text-text-muted'>Digite para buscar roteiros...</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
