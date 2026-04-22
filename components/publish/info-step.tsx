'use client'

import { Input } from '@/components/ui/input'
import type { PublishFormState } from '@/lib/hooks/use-publish-wizard'

interface InfoStepProps {
  form: PublishFormState
  updateForm: (updates: Partial<PublishFormState>) => void
}

export function InfoStep({ form, updateForm }: InfoStepProps) {
  return (
    <div className='flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <div className='flex flex-col gap-2'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Título do Roteiro
        </label>
        <Input
          value={form.title}
          onChange={(e) => updateForm({ title: e.target.value })}
          placeholder='Ex: O Segredo da Montanha'
          className='bg-elevated'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Logline (Curta frase que resume o conflito)
        </label>
        <Input
          value={form.logline}
          onChange={(e) => updateForm({ logline: e.target.value })}
          placeholder='Ex: Um detetive aposentado busca um assassino...'
          className='bg-elevated'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Sinopse
        </label>
        <textarea
          value={form.synopsis}
          onChange={(e) => updateForm({ synopsis: e.target.value })}
          placeholder='Conte mais sobre a história...'
          rows={5}
          className='w-full rounded-sm border border-border-subtle bg-elevated px-3 py-2 text-body-small text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-accent placeholder:text-text-muted transition-all resize-none'
        />
      </div>
    </div>
  )
}
