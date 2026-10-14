'use client'

import { FormField } from '@/components/shared/form-field'
import { Input } from '@/components/ui/input'
import { listCountries } from '@/lib/utils/countries'
import { formatCpf, stripCpf } from '@/lib/utils/cpf'
import { DOCUMENT_LABELS, DOCUMENT_TYPES, documentNeedsCountry, type DocumentType } from '@/lib/utils/documents'
import { cn } from '@/lib/utils'
import type { DocumentFormValues } from '@/lib/validators/document'
import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'

const FIELD_CLASS = 'bg-elevated border-border-subtle focus:border-brand-accent transition-colors'
const SELECT_CLASS = cn(
  'h-11 w-full rounded-md border px-3 text-base text-text-primary focus-visible:outline-none md:text-sm',
  FIELD_CLASS,
)

const PLACEHOLDERS: Record<DocumentType, string> = {
  cpf: '000.000.000-00',
  passport: 'Ex.: AB123456',
  crnm: 'Ex.: V1234567',
  foreign_national_id: 'Número do documento',
}

/** Type, issuing country (when needed) and number of an identity document. */
export function DocumentFields({ form }: { form: UseFormReturn<DocumentFormValues> }) {
  const { register, watch, setValue, formState } = form
  const type = watch('type')
  const number = watch('number')
  const countries = useMemo(listCountries, [])
  const isCpf = type === 'cpf'

  return (
    <>
      <FormField label='Tipo de documento' htmlFor='document-type'>
        <select id='document-type' {...register('type')} className={SELECT_CLASS}>
          {DOCUMENT_TYPES.map((value) => (
            <option key={value} value={value}>
              {DOCUMENT_LABELS[value]}
            </option>
          ))}
        </select>
      </FormField>

      {documentNeedsCountry(type) && (
        <FormField label='País emissor' htmlFor='document-country' error={formState.errors.country?.message}>
          <select id='document-country' {...register('country')} className={SELECT_CLASS}>
            <option value=''>Selecione o país</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label='Número' htmlFor='document-number' error={formState.errors.number?.message}>
        <Input
          id='document-number'
          value={isCpf ? formatCpf(number) : number}
          onChange={(event) => {
            const value = isCpf ? stripCpf(event.target.value) : event.target.value.toUpperCase()
            setValue('number', value, { shouldDirty: true, shouldValidate: formState.isSubmitted })
          }}
          inputMode={isCpf ? 'numeric' : 'text'}
          autoComplete='off'
          placeholder={PLACEHOLDERS[type]}
          className={cn('h-11', FIELD_CLASS)}
        />
      </FormField>
    </>
  )
}
