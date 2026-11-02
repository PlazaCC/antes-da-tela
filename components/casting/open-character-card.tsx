'use client'

import { CastingForm } from '@/components/casting/casting-form'
import { ShareButton } from '@/components/calls/share-button'
import { CharacterDetails } from '@/components/casting/character-details'
import { MediaPlayer } from '@/components/interpreter/media-player'
import { Tag } from '@/components/tag/tag'
import { Button } from '@/components/ui/button'
import { CASTING_STATUS_LABELS } from '@/lib/constants/casting'
import type { OpenCharacter } from '@/lib/types/casting'
import type { CastingSubmitInput } from '@/lib/validators/casting'
import { useState } from 'react'

interface OpenCharacterCardProps {
  character: OpenCharacter
  slug: string
  isOpen: boolean
  isSaving: boolean
  onSubmit: (input: CastingSubmitInput, onDone: () => void) => void
  onWithdraw: (submissionId: string) => void
}

/** E7 — a character open for casting and the interpreter's own take. */
export function OpenCharacterCard({ character, slug, isOpen, isSaving, onSubmit, onWithdraw }: OpenCharacterCardProps) {
  const [editing, setEditing] = useState(false)
  const take = character.myTake
  const canChange = isOpen && (!take || take.status === 'submitted')

  return (
    <article className='rounded-sm border border-border-default bg-surface p-5 flex flex-col gap-4'>
      <CharacterDetails character={character} />
      {take && (
        <div className='flex flex-col gap-2'>
          <Tag variant='neutro' className='self-start'>
            Seu casting · {CASTING_STATUS_LABELS[take.status]}
          </Tag>
          <MediaPlayer src={take.mediaUrl} kind={take.mediaType} className='md:max-w-[420px]' />
          {take.status === 'selected' && (
            <ShareButton
              path={`/editais/${slug}/r/${character.entryId}`}
              text={`Vou interpretar ${character.name} em “${character.scriptTitle}” no Antes da Tela!`}
              label='Compartilhar minha participação'
            />
          )}
        </div>
      )}
      {editing ? (
        <CastingForm
          character={character}
          isSaving={isSaving}
          onSubmit={(input) => onSubmit(input, () => setEditing(false))}
          onCancel={() => setEditing(false)}
        />
      ) : (
        canChange && (
          <div className='flex flex-wrap gap-2'>
            <Button type='button' onClick={() => setEditing(true)}>
              {take ? 'Trocar meu casting' : 'Enviar casting'}
            </Button>
            {take && (
              <Button type='button' variant='ghost' disabled={isSaving} onClick={() => onWithdraw(take.id)}>
                Retirar
              </Button>
            )}
          </div>
        )
      )}
    </article>
  )
}
