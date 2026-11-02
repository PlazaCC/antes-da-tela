'use client'

import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Call } from '@/lib/types/calls'
import { toDateTimeLocal } from '@/lib/utils/format-date'
import { callUpsertSchema, type CallUpsertInput } from '@/lib/validators/calls'
import { useState } from 'react'

const DATE_FIELDS = [
  ['submissionsEndAt', 'Fim das inscrições'],
  ['castingEndAt', 'Fim do casting'],
  ['votingStartAt', 'Início da votação'],
  ['votingEndAt', 'Fim da votação'],
] as const

type DateKey = (typeof DATE_FIELDS)[number][0]
type Values = { slug: string; title: string; partner: string; description: string; rules: string } & Record<DateKey, string>


function initialValues(call: Call | null): Values {
  return {
    slug: call?.slug ?? '',
    title: call?.title ?? '',
    partner: call?.partner ?? '',
    description: call?.description ?? '',
    rules: call?.rules ?? '',
    submissionsEndAt: toDateTimeLocal(call?.submissionsEndAt ?? null),
    castingEndAt: toDateTimeLocal(call?.castingEndAt ?? null),
    votingStartAt: toDateTimeLocal(call?.votingStartAt ?? null),
    votingEndAt: toDateTimeLocal(call?.votingEndAt ?? null),
  }
}

interface CallFormProps {
  call: Call | null
  isSaving: boolean
  onSave: (input: CallUpsertInput) => void
}

/** A2 — create/edit a call. */
export function CallForm({ call, isSaving, onSave }: CallFormProps) {
  const [values, setValues] = useState<Values>(() => initialValues(call))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (key: keyof Values, value: string) => setValues((v) => ({ ...v, [key]: value }))

  const submit = () => {
    const toDate = (value: string) => (value ? new Date(value) : null)
    const parsed = callUpsertSchema.safeParse({
      ...values,
      id: call?.id,
      ...Object.fromEntries(DATE_FIELDS.map(([key]) => [key, toDate(values[key])])),
    })
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])))
      return
    }
    setErrors({})
    onSave(parsed.data)
  }

  return (
    <div className='flex flex-col gap-5'>
      <FormField label='Título' htmlFor='call-title' error={errors.title}>
        <Input id='call-title' value={values.title} onChange={(e) => set('title', e.target.value)} />
      </FormField>
      <FormField label='Endereço (slug)' htmlFor='call-slug' helperText={`/editais/${values.slug || 'meu-edital'}`} error={errors.slug}>
        <Input id='call-slug' value={values.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder='frapa-2026' />
      </FormField>
      <FormField label='Parceiro / organizador' htmlFor='call-partner' labelInfo='Opcional'>
        <Input id='call-partner' value={values.partner} onChange={(e) => set('partner', e.target.value)} placeholder='FRAPA' />
      </FormField>
      <FormField label='Descrição' htmlFor='call-description' labelInfo='Opcional'>
        <Textarea id='call-description' rows={4} value={values.description} onChange={(e) => set('description', e.target.value)} />
      </FormField>
      <FormField label='Regulamento' htmlFor='call-rules' labelInfo='Opcional'>
        <Textarea id='call-rules' rows={6} value={values.rules} onChange={(e) => set('rules', e.target.value)} />
      </FormField>
      <div className='grid gap-4 md:grid-cols-2'>
        {DATE_FIELDS.map(([key, label]) => (
          <FormField key={key} label={label} htmlFor={`call-${key}`} labelInfo='Opcional'>
            <Input id={`call-${key}`} type='datetime-local' value={values[key]} onChange={(e) => set(key, e.target.value)} />
          </FormField>
        ))}
      </div>
      <Button type='button' onClick={submit} disabled={isSaving} className='self-start h-11'>
        {isSaving ? 'Salvando…' : 'Salvar edital'}
      </Button>
    </div>
  )
}
