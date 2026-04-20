'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { AGE_RATINGS, GENRES, formatAgeRating } from '@/lib/constants/scripts'
import { useFilterParams } from '@/lib/hooks/use-filter-params'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FilterSectionHeader({ label }: { label: string }) {
  return (
    <div className='flex items-center py-1.5 border-b border-border-subtle'>
      <span className='font-mono text-[11px] tracking-[0.06em] text-brand-accent uppercase'>{label}</span>
    </div>
  )
}

export function FilterPanel({ open, onOpenChange }: FilterPanelProps) {
  const { genres, ageRatings, toggleGenre, toggleAgeRating, clearFilters } = useFilterParams()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        className={cn('p-0 gap-0 flex flex-col w-80 bg-surface border-border-subtle')}>
        <SheetTitle className='sr-only'>Filtrar roteiros</SheetTitle>

        {/* Header */}
        <div className='flex items-end justify-between px-5 py-[18px] shrink-0'>
          <span className='text-sm font-semibold text-text-primary'>Filtrar roteiros</span>
          <button
            onClick={clearFilters}
            className='text-xs text-brand-accent hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent'>
            Limpar tudo
          </button>
        </div>

        {/* Filters */}
        <div className='flex-1 overflow-y-auto flex flex-col gap-2.5 px-5 pb-4'>
          <div className='flex flex-col gap-3'>
            <FilterSectionHeader label='Gênero' />
            <div className='flex flex-col gap-3'>
              {GENRES.map((g) => (
                <label key={g} className='flex items-center gap-1.5 cursor-pointer select-none'>
                  <Checkbox
                    checked={genres.includes(g)}
                    onCheckedChange={() => toggleGenre(g)}
                    className='h-4 w-4 rounded-sm bg-elevated border-border-subtle data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent'
                  />
                  <span className='text-xs text-text-secondary capitalize'>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <FilterSectionHeader label='Classificação' />
            <div className='flex flex-col gap-3'>
              {AGE_RATINGS.map((r) => (
                <label key={r} className='flex items-center gap-1.5 cursor-pointer select-none'>
                  <Checkbox
                    checked={ageRatings.includes(r)}
                    onCheckedChange={() => toggleAgeRating(r)}
                    className='h-4 w-4 rounded-sm bg-elevated border-border-subtle data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent'
                  />
                  <span className='text-xs text-text-secondary uppercase'>
                    {formatAgeRating(r)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='px-5 py-4 shrink-0 border-t border-border-subtle'>
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              'w-full py-2 rounded-sm text-sm font-medium transition-colors',
              'bg-brand-accent text-surface hover:bg-brand-accent/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
            )}>
            Aplicar Filtros
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
