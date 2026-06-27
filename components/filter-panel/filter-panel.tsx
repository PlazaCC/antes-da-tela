'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  AGE_RATINGS,
  MACRO_GENRES,
  formatAgeRating,
} from '@/lib/constants/scripts'
import { useFilterParams } from '@/lib/hooks/use-filter-params'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface FilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FilterSectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center border-b border-border-subtle py-1.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-brand-accent">
        {label}
      </span>
    </div>
  )
}

function GenreFilter({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (g: (typeof MACRO_GENRES)[number]) => void
}) {
  const [search, setSearch] = useState('')
  const filtered = MACRO_GENRES.filter((g) => g.includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Buscar gênero..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 rounded-sm border border-border-subtle bg-elevated px-3 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      />
      <div className="flex max-h-52 flex-col gap-2.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-1 text-xs text-text-muted">
            Nenhum gênero encontrado.
          </p>
        ) : (
          filtered.map((g) => (
            <label
              key={g}
              className="flex cursor-pointer select-none items-center gap-1.5"
            >
              <Checkbox
                checked={selected.includes(g)}
                onCheckedChange={() => onToggle(g)}
                className="h-4 w-4 rounded-sm border-border-subtle bg-elevated data-[state=checked]:border-brand-accent data-[state=checked]:bg-brand-accent"
              />
              <span className="text-xs capitalize text-text-secondary">
                {g}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

export function FilterPanel({ open, onOpenChange }: FilterPanelProps) {
  const { genres, ageRatings, toggleGenre, toggleAgeRating, clearFilters } =
    useFilterParams()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className={cn(
          'flex w-80 flex-col gap-0 border-border-subtle bg-surface p-0'
        )}
      >
        {/* <SheetTitle className="sr-only">Filtrar roteiros</SheetTitle> */}
        <div className="p-5">
          <div className="flex shrink-0 items-end justify-between">
            <span className="text-sm font-semibold text-text-primary">
              Filtrar roteiros
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-4">
          <div className="flex flex-col gap-3">
            <FilterSectionHeader label="Gênero" />
            <GenreFilter selected={genres} onToggle={toggleGenre} />
          </div>

          <div className="flex flex-col gap-3">
            <FilterSectionHeader label="Classificação" />
            <div className="flex flex-col gap-3">
              {AGE_RATINGS.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer select-none items-center gap-1.5"
                >
                  <Checkbox
                    checked={ageRatings.includes(r)}
                    onCheckedChange={() => toggleAgeRating(r)}
                    className="h-4 w-4 rounded-sm border-border-subtle bg-elevated data-[state=checked]:border-brand-accent data-[state=checked]:bg-brand-accent"
                  />
                  <span className="text-xs uppercase text-text-secondary">
                    {formatAgeRating(r)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-4 border-t border-border-subtle px-5 py-4">
          <button
            onClick={clearFilters}
            className="text-xs text-brand-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            Limpar tudo
          </button>

          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              'w-full rounded-sm py-2 text-sm font-medium transition-colors',
              'bg-brand-accent text-surface hover:bg-brand-accent/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2'
            )}
          >
            Aplicar Filtros
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
