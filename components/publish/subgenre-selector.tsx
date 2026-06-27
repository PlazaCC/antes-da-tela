'use client'

import {
  GENRE_COMBINATIONS,
  GENRES,
  MAX_SUBGENRES,
} from '@/lib/constants/scripts'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type GenreValue = (typeof GENRES)[number]

interface SubgenreSelectorProps {
  genre: string
  subgenres: string[]
  onToggle: (item: GenreValue) => void
}

function Chip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-9 rounded-sm border px-3 text-xs font-medium transition-all',
        active
          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent'
          : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
        disabled &&
          'cursor-not-allowed opacity-40 hover:border-border-subtle hover:text-text-muted'
      )}
    >
      {label}
    </button>
  )
}

export function SubgenreSelector({
  genre,
  subgenres,
  onToggle,
}: SubgenreSelectorProps) {
  const [search, setSearch] = useState('')

  const recommendations = (GENRE_COMBINATIONS[genre] ?? []) as GenreValue[]
  const isDisabled = (item: string) =>
    !subgenres.includes(item) && subgenres.length >= MAX_SUBGENRES

  const others = GENRES.filter(
    (g) => g !== genre && !(recommendations as string[]).includes(g)
  )
  const filtered = search.trim()
    ? others.filter((g) => g.includes(search.toLowerCase()))
    : others

  return (
    <div className="flex flex-col gap-5">
      <input
        type="text"
        placeholder="Buscar todos os gêneros..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 rounded-sm border border-border-subtle bg-elevated px-3 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
      />

      {recommendations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            Recomendados
          </span>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((item) => (
              <Chip
                key={item}
                label={item}
                active={subgenres.includes(item)}
                disabled={isDisabled(item)}
                onClick={() => onToggle(item)}
              />
            ))}
          </div>
        </div>
      )}

      {search && filtered.length === 0 ? (
        <p className="py-1 text-xs text-text-muted">
          Nenhum gênero encontrado para &quot;{search}&quot;
        </p>
      ) : (
        <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
          {filtered.map((item) => (
            <Chip
              key={item}
              label={item}
              active={subgenres.includes(item)}
              disabled={isDisabled(item)}
              onClick={() => onToggle(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
