'use client'

import { MediaUploadField } from '@/components/interpreter/media-upload-field'
import { ChipGroup } from '@/components/preferences/chip-group'
import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CONSENT_TEXT, INTERPRETER_MODALITIES, MODALITY_LABELS, type InterpreterModality } from '@/lib/constants/interpreters'
import { useInterpreterForm } from '@/lib/hooks/use-interpreter-form'
import type { InterpreterProfile } from '@/lib/types/interpreters'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const inputClass = 'bg-elevated border-border-subtle focus:border-brand-accent transition-colors'

interface InterpreterFormProps {
  current: InterpreterProfile | null
  onSubmitted?: () => void
  /** Extra actions under the submit button (e.g. "Fazer depois" in the onboarding). */
  secondaryAction?: ReactNode
  className?: string
}

/** Interpreter registration (wireframes O4a/O4b, P3). Always goes to curation. */
export function InterpreterForm({ current, onSubmitted, secondaryAction, className }: InterpreterFormProps) {
  const form = useInterpreterForm(current, { onSubmitted })
  const { fields, setField, errors } = form

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <FormField label='Como você quer interpretar?' error={errors.modalities}>
        <ChipGroup
          options={INTERPRETER_MODALITIES}
          selected={form.modalities}
          onToggle={(option) => form.toggleModality(option as InterpreterModality)}
          getLabel={(option) => MODALITY_LABELS[option as InterpreterModality]}
        />
      </FormField>

      {form.mediaKind && (
        <FormField
          label={form.mediaKind === 'video' ? 'Vídeo de apresentação' : 'Áudio de apresentação'}
          helperText='Até 30 segundos. Apresente-se e, se quiser, interprete um trecho curto.'
          error={errors.mediaType}>
          <MediaUploadField kind={form.mediaKind} value={form.media} onUploaded={form.onMediaUploaded} />
        </FormField>
      )}

      <FormField label='Data de nascimento' htmlFor='interpreter-birth' error={errors.birthDate}>
        <Input id='interpreter-birth' type='date' value={fields.birthDate} onChange={(e) => setField('birthDate', e.target.value)} className={inputClass} />
      </FormField>
      <FormField label='Experiência' htmlFor='interpreter-experience' labelInfo='Opcional'>
        <Textarea
          id='interpreter-experience'
          rows={3}
          value={fields.experience}
          onChange={(e) => setField('experience', e.target.value)}
          placeholder='Cursos, peças, trabalhos…'
          className={cn(inputClass, 'resize-none')}
        />
      </FormField>
      <FormField label='Faixa etária de atuação' htmlFor='interpreter-age-range' labelInfo='Opcional'>
        <Input id='interpreter-age-range' value={fields.ageRange} onChange={(e) => setField('ageRange', e.target.value)} placeholder='25–35 anos' className={inputClass} />
      </FormField>
      <FormField label='Idiomas e sotaques' htmlFor='interpreter-languages' labelInfo='Opcional'>
        <Input id='interpreter-languages' value={fields.languages} onChange={(e) => setField('languages', e.target.value)} placeholder='PT-BR (nordestino), inglês' className={inputClass} />
      </FormField>
      <FormField label='DRT' htmlFor='interpreter-drt' labelInfo='Opcional'>
        <Input id='interpreter-drt' value={fields.drt} onChange={(e) => setField('drt', e.target.value)} className={inputClass} />
      </FormField>

      <div className='flex flex-col gap-2'>
        <label className='flex items-start gap-3 text-body-small text-text-secondary cursor-pointer'>
          <Checkbox checked={form.consent} onCheckedChange={(checked) => form.setConsent(checked === true)} className='mt-0.5' />
          <span>{CONSENT_TEXT}</span>
        </label>
        {errors.consent && <p className='text-state-error text-xs font-mono'>{errors.consent}</p>}
      </div>

      <div className='flex flex-col gap-2'>
        <Button type='button' onClick={form.submit} disabled={form.isPending} className='h-11 w-full'>
          {form.isPending ? 'Enviando…' : 'Enviar para curadoria'}
        </Button>
        {secondaryAction}
      </div>
    </div>
  )
}
