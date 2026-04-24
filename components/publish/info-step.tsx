'use client'

import { FormField } from '@/components/shared/form-field'
import { Input } from '@/components/ui/input'
import type { PublishFormValues } from '@/lib/validators/publish'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

interface InfoStepProps {
  register: UseFormRegister<PublishFormValues>
  errors: FieldErrors<PublishFormValues>
}

export function InfoStep({ register, errors }: InfoStepProps) {
  return (
    <div className='flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <FormField label='Título do Roteiro' error={errors.title?.message as string | undefined}>
        <Input {...register('title')} placeholder='Ex: O Segredo da Montanha' className='bg-elevated' />
      </FormField>

      <FormField
        label='Logline (Curta frase que resume o conflito)'
        error={errors.logline?.message as string | undefined}>
        <Input
          {...register('logline')}
          placeholder='Ex: Um detetive aposentado busca um assassino...'
          className='bg-elevated'
        />
      </FormField>

      <FormField label='Sinopse' error={errors.synopsis?.message as string | undefined}>
        <textarea
          {...register('synopsis')}
          placeholder='Conte mais sobre a história...'
          rows={5}
          className='w-full rounded-sm border border-border-subtle bg-elevated px-3 py-2 text-body-small text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-text-muted transition-all resize-none'
        />
      </FormField>
    </div>
  )
}
