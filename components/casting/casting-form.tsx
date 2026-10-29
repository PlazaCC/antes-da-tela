'use client'

import { MediaUploadField } from '@/components/interpreter/media-upload-field'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { requiredMediaKind } from '@/lib/constants/interpreters'
import type { UploadedMedia } from '@/lib/hooks/use-interpreter-media'
import type { OpenCharacter } from '@/lib/types/casting'
import type { CastingSubmitInput } from '@/lib/validators/casting'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface CastingFormProps {
  character: OpenCharacter
  isSaving: boolean
  onSubmit: (input: CastingSubmitInput) => void
  onCancel: () => void
}

/** E8 — reuse the registration presentation or send a new take (≤ 30s) for this character. */
export function CastingForm({ character, isSaving, onSubmit, onCancel }: CastingFormProps) {
  const [source, setSource] = useState<'profile' | 'upload'>('profile')
  const [upload, setUpload] = useState<UploadedMedia | null>(null)
  const [note, setNote] = useState('')
  const kind = requiredMediaKind(character.modalities)
  const canSubmit = source === 'profile' || !!upload

  const submit = () => {
    const media: CastingSubmitInput['media'] =
      source === 'upload' && upload
        ? { source: 'upload', path: upload.path, type: upload.kind, durationSeconds: upload.durationSeconds }
        : { source: 'profile' }
    onSubmit({ characterId: character.id, media, note: note || undefined })
  }

  const option = (value: 'profile' | 'upload', title: string, description: string) => (
    <button
      type='button'
      aria-pressed={source === value}
      onClick={() => setSource(value)}
      className={cn(
        'text-left rounded-sm border p-3 flex-1',
        source === value ? 'border-brand-accent ring-1 ring-brand-accent bg-brand-accent/5' : 'border-border-subtle bg-elevated',
      )}>
      <span className='block font-medium text-text-primary text-sm'>{title}</span>
      <span className='block text-xs text-text-muted'>{description}</span>
    </button>
  )

  return (
    <div className='flex flex-col gap-4 rounded-sm border border-border-subtle bg-elevated/40 p-4'>
      <div className='flex flex-col md:flex-row gap-2'>
        {option('profile', 'Usar minha apresentação', 'O material do seu cadastro de intérprete.')}
        {option('upload', 'Enviar material novo', `Um ${kind === 'video' ? 'vídeo' : 'áudio'} de até 30s para este personagem.`)}
      </div>
      {source === 'upload' && <MediaUploadField kind={kind} value={upload} onUploaded={setUpload} />}
      <Textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 500))}
        placeholder='Observação para a curadoria (opcional)'
        className='bg-elevated border-border-subtle resize-none'
      />
      <div className='flex gap-2'>
        <Button type='button' onClick={submit} disabled={!canSubmit || isSaving}>
          {isSaving ? 'Enviando…' : 'Enviar casting'}
        </Button>
        <Button type='button' variant='ghost' onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
