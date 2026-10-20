'use client'

import { Input } from '@/components/ui/input'
import { MAX_CHARACTER_TRAIT_LENGTH, MAX_CHARACTER_TRAITS } from '@/lib/constants/scripts'
import { normalizeTrait, useTraitSuggestions } from '@/lib/hooks/use-trait-suggestions'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'

interface TraitInputProps {
  traits: string[]
  onChange: (traits: string[]) => void
  className?: string
}

const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1)

export function TraitInput({ traits, onChange, className }: TraitInputProps) {
  const [query, setQuery] = useState('')
  const suggestions = useTraitSuggestions(query, traits)
  const isFull = traits.length >= MAX_CHARACTER_TRAITS
  const typed = query.trim()
  const hasExactMatch = suggestions.some((s) => normalizeTrait(s.trait) === normalizeTrait(typed))

  const addTrait = (raw: string) => {
    const value = raw.trim().replace(/\s+/g, ' ').slice(0, MAX_CHARACTER_TRAIT_LENGTH)
    setQuery('')
    if (!value || isFull) return
    const key = normalizeTrait(value)
    if (traits.some((trait) => normalizeTrait(trait) === key)) return
    // Reuse the community's spelling when the typed trait already exists.
    const existing = suggestions.find((s) => normalizeTrait(s.trait) === key)
    onChange([...traits, existing?.trait ?? capitalize(value)])
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTrait(query)
    } else if (event.key === 'Backspace' && !query && traits.length > 0) {
      onChange(traits.slice(0, -1))
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {traits.length > 0 && (
        <ul className='flex flex-wrap gap-2' aria-label='Características adicionadas'>
          {traits.map((trait) => (
            <li
              key={trait}
              className='inline-flex items-center gap-1 rounded-full border border-brand-accent/40 bg-brand-accent/10 py-1 pl-3 pr-1.5 text-xs font-medium text-brand-accent'>
              {trait}
              <button
                type='button'
                onClick={() => onChange(traits.filter((t) => t !== trait))}
                className='rounded-full p-0.5 transition-colors hover:bg-brand-accent/20'
                aria-label={`Remover ${trait}`}>
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value.slice(0, MAX_CHARACTER_TRAIT_LENGTH))}
        onKeyDown={handleKeyDown}
        disabled={isFull}
        placeholder={isFull ? `Limite de ${MAX_CHARACTER_TRAITS} características` : 'Digite e pressione Enter. Ex.: Leal'}
        className='min-h-[40px] bg-elevated text-sm'
      />

      {!isFull && (typed || suggestions.length > 0) && (
        <div className='flex flex-col gap-2'>
          <span className='font-mono text-[10px] uppercase tracking-wider text-text-muted'>
            {typed ? 'Sugestões' : 'Mais usadas'}
          </span>
          <div className='flex flex-wrap gap-2'>
            {typed && !hasExactMatch && (
              <SuggestionChip label={`Adicionar "${capitalize(typed)}"`} onClick={() => addTrait(typed)} highlight />
            )}
            {suggestions.map((s) => (
              <SuggestionChip
                key={s.trait}
                label={s.trait}
                meta={s.uses > 0 ? String(s.uses) : undefined}
                onClick={() => addTrait(s.trait)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface SuggestionChipProps {
  label: string
  meta?: string
  highlight?: boolean
  onClick: () => void
}

function SuggestionChip({ label, meta, highlight, onClick }: SuggestionChipProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        highlight
          ? 'border-brand-accent text-brand-accent hover:bg-brand-accent/10'
          : 'border-border-subtle bg-elevated text-text-secondary hover:border-text-muted hover:text-text-primary',
      )}>
      <Plus size={12} />
      {label}
      {meta && <span className='font-mono text-[10px] text-text-muted'>· {meta}</span>}
    </button>
  )
}
