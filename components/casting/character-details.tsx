import { Tag } from '@/components/tag/tag'
import { MODALITY_LABELS } from '@/lib/constants/interpreters'
import type { CastingCharacter } from '@/lib/types/casting'
import { cn } from '@/lib/utils'

/** Character description for casting (E7/E8, A4, E6). */
export function CharacterDetails({ character, className }: { character: CastingCharacter; className?: string }) {
  const facts = [character.apparentAge && `${character.apparentAge} anos`, character.gender, character.reference && `Ref.: ${character.reference}`].filter(Boolean)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className='text-xs text-text-muted'>
        {character.scriptTitle} · {character.authorName}
      </p>
      <h3 className='font-display text-heading-4 text-text-primary'>{character.name}</h3>
      <div className='flex flex-wrap gap-1.5'>
        {character.modalities.map((m) => (
          <Tag key={m} variant='importante'>
            {MODALITY_LABELS[m]}
          </Tag>
        ))}
        {character.traits.map((trait) => (
          <Tag key={trait} variant='neutro'>
            {trait}
          </Tag>
        ))}
      </div>
      {facts.length > 0 && <p className='text-xs text-text-secondary'>{facts.join(' · ')}</p>}
      {character.description && <p className='text-body-small text-text-secondary whitespace-pre-line'>{character.description}</p>}
    </div>
  )
}
