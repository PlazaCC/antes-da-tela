'use client'

import { CallCharacterEditor } from '@/components/calls/call-character-editor'
import { CastPicker } from '@/components/casting/cast-picker'
import { EntryCard } from '@/components/calls/entry-card'
import { ShareButton } from '@/components/calls/share-button'
import { Tag, type TagVariant } from '@/components/tag/tag'
import { Button } from '@/components/ui/button'
import { toDrafts, useCallCharacters, type CallCharacterDraft } from '@/lib/hooks/use-call-characters'
import type { CallPhase } from '@/lib/constants/calls'
import type { CallEntry } from '@/lib/types/calls'
import type { ReviewStatus } from '@/lib/types/interpreters'
import { useState } from 'react'

const STATUS: Record<ReviewStatus, { label: string; variant: TagVariant }> = {
  pending: { label: 'Em análise', variant: 'warning' },
  approved: { label: 'Aprovada', variant: 'success' },
  rejected: { label: 'Recusada', variant: 'error' },
}

interface MyEntryProps {
  entry: CallEntry
  slug: string
  phase: CallPhase
  canEdit: boolean
  isSaving: boolean
  onSaveCharacters: (drafts: CallCharacterDraft[], onDone: () => void) => void
  onWithdraw: () => void
}

/** E5 — one of the author's entries: status, characters (editable while open), withdraw. */
export function MyEntry({ entry, slug, phase, canEdit, isSaving, onSaveCharacters, onWithdraw }: MyEntryProps) {
  const [editing, setEditing] = useState(false)
  const characters = useCallCharacters(toDrafts(entry.characters))
  const status = STATUS[entry.status]

  const footer = (
    <div className='flex flex-col gap-3 pt-1'>
      <Tag variant={status.variant} className='self-start'>
        {status.label}
      </Tag>
      {entry.reviewReason && <p className='text-body-small text-text-secondary'>Motivo: {entry.reviewReason}</p>}
      {entry.status === 'approved' && (
        <ShareButton
          path={`/editais/${slug}/r/${entry.id}`}
          text={`Meu roteiro “${entry.script.title}” está no edital do Antes da Tela!`}
          label='Compartilhar minha participação'
        />
      )}
      {canEdit && !editing && (
        <div className='flex flex-wrap gap-2'>
          <Button type='button' size='sm' variant='outline' onClick={() => setEditing(true)}>
            Editar personagens
          </Button>
          {entry.status === 'pending' && (
            <Button type='button' size='sm' variant='ghost' onClick={onWithdraw} disabled={isSaving}>
              Retirar inscrição
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className='flex flex-col gap-4'>
      <EntryCard entry={entry} footer={footer} />
      {entry.status === 'approved' && ['curation', 'voting', 'finished'].includes(phase) && (
        <CastPicker entryId={entry.id} canChoose={phase === 'curation'} />
      )}
      {editing && (
        <div className='flex flex-col gap-4'>
          <CallCharacterEditor drafts={characters.drafts} onAdd={characters.add} onRemove={characters.remove} onUpdate={characters.update} />
          <div className='flex gap-2'>
            <Button type='button' disabled={!characters.isValid || isSaving} onClick={() => onSaveCharacters(characters.drafts, () => setEditing(false))}>
              Salvar personagens
            </Button>
            <Button type='button' variant='ghost' onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
