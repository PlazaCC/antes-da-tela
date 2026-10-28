'use client'

import { TraitInput } from '@/components/publish/trait-input'
import { Input } from '@/components/ui/input'
import { CHARACTER_GENDERS } from '@/lib/constants/scripts'
import type { CharacterEntry } from '@/lib/hooks/use-character-entries'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface CharacterCardProps {
  entry: CharacterEntry
  index: number
  onUpdate: (patch: Partial<CharacterEntry>) => void
  onRemove: () => void
}

const MAX_DESCRIPTION = 1000

export function CharacterCard({ entry, index, onUpdate, onRemove }: CharacterCardProps) {
  const missingName = entry.name.trim().length === 0

  return (
    <div className='flex flex-col gap-5 rounded-sm border border-border-subtle bg-elevated/40 p-4'>
      <div className='flex items-center justify-between'>
        <span className='font-mono text-[11px] uppercase tracking-wider text-text-muted'>Personagem {index + 1}</span>
        <button
          type='button'
          onClick={onRemove}
          className='rounded-sm p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-state-error'
          aria-label='Remover personagem'>
          <Trash2 size={16} />
        </button>
      </div>

      <div className='grid gap-4 md:grid-cols-[1fr_160px]'>
        <Field label='Nome *' error={missingName ? 'Dê um nome ao personagem ou remova-o' : undefined}>
          <Input
            value={entry.name}
            onChange={(e) => onUpdate({ name: e.target.value.slice(0, 100) })}
            placeholder='Ex.: Helena Duarte'
            className='min-h-[40px] bg-elevated text-sm'
          />
        </Field>
        <Field label='Idade aparente'>
          <Input
            value={entry.apparentAge}
            onChange={(e) => onUpdate({ apparentAge: e.target.value.slice(0, 30) })}
            placeholder='Ex.: 30–35 anos'
            className='min-h-[40px] bg-elevated text-sm'
          />
        </Field>
      </div>

      <Field label='Gênero'>
        <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
          {CHARACTER_GENDERS.map((gender) => (
            <button
              key={gender}
              type='button'
              aria-pressed={entry.gender === gender}
              onClick={() => onUpdate({ gender: entry.gender === gender ? '' : gender })}
              className={cn(
                'h-9 rounded-sm border px-3 text-xs font-medium transition-all',
                entry.gender === gender
                  ? 'border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent'
                  : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
              )}>
              {gender}
            </button>
          ))}
        </div>
      </Field>

      <Field label='Sobre o personagem' info={`${entry.description.length}/${MAX_DESCRIPTION}`}>
        <textarea
          value={entry.description}
          onChange={(e) => onUpdate({ description: e.target.value.slice(0, MAX_DESCRIPTION) })}
          placeholder='Quem é, o que deseja, o que esconde...'
          rows={3}
          className='w-full resize-none rounded-sm border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:border-brand-accent focus:outline-none'
        />
      </Field>

      <Field label='Características'>
        <TraitInput traits={entry.traits} onChange={(traits) => onUpdate({ traits })} />
      </Field>
    </div>
  )
}

interface FieldProps {
  label: string
  info?: string
  error?: string
  children: ReactNode
}

function Field({ label, info, error, children }: FieldProps) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-end justify-between gap-3'>
        <span className='font-mono text-[10px] uppercase tracking-wider text-text-muted'>{label}</span>
        {info && <span className='font-mono text-[10px] tracking-wider text-text-muted'>{info}</span>}
      </div>
      {children}
      {error && <p className='font-mono text-xs text-state-error'>{error}</p>}
    </div>
  )
}
