'use client'

import { ChipGroup } from '@/components/preferences/chip-group'
import { CharacterCard } from '@/components/publish/character-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { INTERPRETER_MODALITIES, MODALITY_LABELS, type InterpreterModality } from '@/lib/constants/interpreters'
import { MAX_CHARACTERS } from '@/lib/constants/scripts'
import type { CallCharacterDraft } from '@/lib/hooks/use-call-characters'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface CallCharacterEditorProps {
  drafts: CallCharacterDraft[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, patch: Partial<CallCharacterDraft>) => void
  className?: string
}

/** E4 — characters to cast: the publish character card + modality and scene reference. */
export function CallCharacterEditor({ drafts, onAdd, onRemove, onUpdate, className }: CallCharacterEditorProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {drafts.map((draft, index) => (
        <div key={draft.id} className='flex flex-col gap-3'>
          <CharacterCard entry={draft} index={index} onUpdate={(patch) => onUpdate(draft.id, patch)} onRemove={() => onRemove(draft.id)} />
          <div className='grid gap-3 md:grid-cols-2 rounded-sm border border-border-subtle bg-elevated/40 p-4'>
            <div className='flex flex-col gap-2'>
              <span className='font-mono text-[11px] uppercase tracking-wider text-text-muted'>Interpretação *</span>
              <ChipGroup
                options={INTERPRETER_MODALITIES}
                selected={draft.modalities}
                getLabel={(option) => MODALITY_LABELS[option as InterpreterModality]}
                onToggle={(option) => {
                  const modality = option as InterpreterModality
                  const next = draft.modalities.includes(modality)
                    ? draft.modalities.filter((m) => m !== modality)
                    : [...draft.modalities, modality]
                  onUpdate(draft.id, { modalities: next })
                }}
              />
              {draft.modalities.length === 0 && <p className='text-state-error text-xs font-mono'>Escolha atuar, narrar ou os dois</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <span className='font-mono text-[11px] uppercase tracking-wider text-text-muted'>Cena de referência</span>
              <Input
                value={draft.reference}
                onChange={(e) => onUpdate(draft.id, { reference: e.target.value.slice(0, 200) })}
                placeholder='Ex.: página 12, cena 4'
                className='bg-elevated border-border-subtle'
              />
            </div>
          </div>
        </div>
      ))}
      {drafts.length < MAX_CHARACTERS && (
        <Button type='button' variant='outline' onClick={onAdd} className='self-start'>
          <Plus size={16} /> Adicionar personagem
        </Button>
      )}
    </div>
  )
}
