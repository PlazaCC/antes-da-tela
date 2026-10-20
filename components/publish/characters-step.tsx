'use client'

import { CharacterCard } from '@/components/publish/character-card'
import { MAX_CHARACTERS } from '@/lib/constants/scripts'
import type { CharacterEntry, UseCharacterEntriesResult } from '@/lib/hooks/use-character-entries'
import { Plus, Users } from 'lucide-react'

interface CharactersStepProps {
  entries: CharacterEntry[]
  addEntry: UseCharacterEntriesResult['addEntry']
  removeEntry: UseCharacterEntriesResult['removeEntry']
  updateEntry: UseCharacterEntriesResult['updateEntry']
}

export function CharactersStep({ entries, addEntry, removeEntry, updateEntry }: CharactersStepProps) {
  return (
    <div className='flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <div className='flex items-end justify-between'>
        <span className='font-mono text-xs uppercase tracking-wider text-text-secondary'>Personagens</span>
        <span className='font-mono text-[10px] uppercase tracking-widest text-text-muted'>
          {entries.length}/{MAX_CHARACTERS} · Opcional
        </span>
      </div>

      {entries.length === 0 && (
        <div className='flex flex-col items-center gap-3 rounded-sm border border-dashed border-border-default px-6 py-10 text-center'>
          <div className='flex h-10 w-10 items-center justify-center rounded-sm bg-brand-accent/10 text-brand-accent'>
            <Users size={20} />
          </div>
          <p className='max-w-sm text-sm text-text-secondary'>
            Apresente o elenco da sua obra: quem são, como são e o que os move. Você pode pular esta etapa e voltar
            depois pela edição do roteiro.
          </p>
        </div>
      )}

      {entries.map((entry, index) => (
        <CharacterCard
          key={entry.id}
          entry={entry}
          index={index}
          onUpdate={(patch) => updateEntry(entry.id, patch)}
          onRemove={() => removeEntry(entry.id)}
        />
      ))}

      {entries.length < MAX_CHARACTERS && (
        <button
          type='button'
          onClick={addEntry}
          className='flex h-11 items-center justify-center gap-2 rounded-sm border border-dashed border-border-default text-sm font-medium text-text-secondary transition-colors hover:border-brand-accent hover:text-brand-accent'>
          <Plus size={16} />
          Adicionar personagem
        </button>
      )}
    </div>
  )
}
