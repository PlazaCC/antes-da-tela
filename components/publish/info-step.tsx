'use client'

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
      <div className='flex flex-col gap-2'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Título do Roteiro
        </label>
        <Input {...register('title')} placeholder='Ex: O Segredo da Montanha' className='bg-elevated' />
        {errors.title && <p className='text-state-error text-xs font-mono'>{errors.title.message}</p>}
      </div>

      <div className='flex flex-col gap-2'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Logline (Curta frase que resume o conflito)
        </label>
        <Input
          {...register('logline')}
          placeholder='Ex: Um detetive aposentado busca um assassino...'
          className='bg-elevated'
        />
        {errors.logline && <p className='text-state-error text-xs font-mono'>{errors.logline.message}</p>}
      </div>

      <div className='flex flex-col gap-2'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Sinopse
        </label>
        <textarea
          {...register('synopsis')}
          placeholder='Conte mais sobre a história...'
          rows={5}
          className='w-full rounded-sm border border-border-subtle bg-elevated px-3 py-2 text-body-small text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-text-muted transition-all resize-none'
        />
        {errors.synopsis && <p className='text-state-error text-xs font-mono'>{errors.synopsis.message}</p>}
      </div>
    </div>
  )
}
