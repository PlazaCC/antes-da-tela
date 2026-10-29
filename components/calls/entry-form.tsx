'use client'

import { CallCharacterEditor } from '@/components/calls/call-character-editor'
import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toDrafts, useCallCharacters } from '@/lib/hooks/use-call-characters'
import type { EligibleScript } from '@/lib/types/calls'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

interface EntryFormProps {
  scripts: EligibleScript[]
  isSaving: boolean
  onSubmit: (scriptId: string, drafts: ReturnType<typeof useCallCharacters>['drafts'], onDone: () => void) => void
}

/** E3 + E4 — pick a published script and describe the characters to cast. */
export function EntryForm({ scripts, isSaving, onSubmit }: EntryFormProps) {
  const [scriptId, setScriptId] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const characters = useCallCharacters()

  const pick = (script: EligibleScript) => {
    setScriptId(script.id)
    characters.setDrafts(toDrafts(script.characters))
  }

  if (scripts.length === 0) {
    return (
      <div className='rounded-sm border border-dashed border-border-default p-6 flex flex-col gap-3 items-start'>
        <p className='text-body-small text-text-secondary'>Você não tem roteiros publicados que ainda possam ser inscritos.</p>
        <Button asChild variant='outline'>
          <Link href='/publish'>Publicar um roteiro</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6'>
      <FormField label='Roteiro'>
        <div className='flex flex-col gap-2'>
          {scripts.map((script) => (
            <button
              key={script.id}
              type='button'
              aria-pressed={scriptId === script.id}
              onClick={() => pick(script)}
              className={cn(
                'text-left rounded-sm border p-3 transition-all',
                scriptId === script.id ? 'border-brand-accent ring-1 ring-brand-accent bg-brand-accent/5' : 'border-border-subtle bg-elevated hover:border-text-muted',
              )}>
              <span className='font-medium text-text-primary'>{script.title}</span>
              <span className='block text-xs text-text-muted'>{script.characters.length} personagens cadastrados no roteiro</span>
            </button>
          ))}
          <Link href='/publish' className='text-xs text-text-muted underline underline-offset-2 self-start'>
            + Publicar outro roteiro
          </Link>
        </div>
      </FormField>

      {scriptId && (
        <>
          <FormField label='Personagens para interpretação' helperText='Descreva quem você quer ver interpretado. Pode ajustar até o fim das inscrições.'>
            <CallCharacterEditor drafts={characters.drafts} onAdd={characters.add} onRemove={characters.remove} onUpdate={characters.update} />
          </FormField>
          <label className='flex items-start gap-3 text-body-small text-text-secondary cursor-pointer'>
            <Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} className='mt-0.5' />
            <span>Li e aceito o regulamento do edital.</span>
          </label>
          <Button
            type='button'
            className='h-11'
            disabled={!accepted || !characters.isValid || isSaving}
            onClick={() => onSubmit(scriptId, characters.drafts, () => setScriptId(null))}>
            {isSaving ? 'Enviando…' : 'Enviar inscrição'}
          </Button>
        </>
      )}
    </div>
  )
}
