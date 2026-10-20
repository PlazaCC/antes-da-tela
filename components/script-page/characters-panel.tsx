import { Button } from '@/components/ui/button'
import type { ScriptCharacter } from '@/lib/types'
import { X } from 'lucide-react'

interface CharactersPanelProps {
  characters: ScriptCharacter[]
  onClose?: () => void
  hideClose?: boolean
}

export function CharactersPanel({ characters, onClose, hideClose }: CharactersPanelProps) {
  return (
    <aside className='flex h-full min-h-0 w-full flex-col bg-surface'>
      <div className='flex shrink-0 items-center justify-between border-b border-border-subtle px-5 py-4 lg:py-2'>
        <p className='font-mono text-label-mono-caps uppercase leading-4 tracking-wider text-text-secondary'>
          Personagens · {characters.length}
        </p>
        {!hideClose && (
          <Button variant='ghost' size='icon-xs' onClick={onClose} aria-label='Fechar personagens'>
            <X />
          </Button>
        )}
      </div>

      <ul className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-3'>
        {characters.map((character) => (
          <CharacterItem key={character.id} character={character} />
        ))}
      </ul>
    </aside>
  )
}

function CharacterItem({ character }: { character: ScriptCharacter }) {
  const meta = [character.gender, character.apparent_age].filter(Boolean).join(' · ')

  return (
    <li className='flex min-w-0 flex-col gap-2 rounded-sm border border-border-subtle bg-elevated p-3'>
      <div className='flex flex-col gap-0.5'>
        <h3 className='font-display text-base font-medium leading-tight text-text-primary'>{character.name}</h3>
        {meta && <p className='font-mono text-label-mono-small text-text-muted'>{meta}</p>}
      </div>

      {character.description && (
        <p className='whitespace-pre-line break-words text-body-small text-text-secondary'>{character.description}</p>
      )}

      {character.traits.length > 0 && (
        <ul className='flex flex-wrap gap-1.5' aria-label={`Características de ${character.name}`}>
          {character.traits.map((trait) => (
            <li
              key={trait}
              className='rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-accent'>
              {trait}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
