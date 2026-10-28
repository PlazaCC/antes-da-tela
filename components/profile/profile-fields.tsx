'use client'

import { ChipGroup } from '@/components/preferences/chip-group'
import { FormField } from '@/components/shared/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GENDER_OPTIONS, PRONOUN_OPTIONS, type Gender } from '@/lib/constants/preferences'
import { cn } from '@/lib/utils'
import type { ProfileFormValues } from '@/lib/validators/profile'
import type { UseFormReturn } from 'react-hook-form'

const inputClass = 'bg-elevated border-border-subtle focus:border-brand-accent transition-colors'

interface ProfileFieldsProps {
  form: UseFormReturn<ProfileFormValues>
  gender: Gender | null
  onGenderChange: (gender: Gender | null) => void
  className?: string
}

/** Public profile fields + private gender, shared by /profile/edit and the onboarding. */
export function ProfileFields({ form, gender, onGenderChange, className }: ProfileFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <FormField label='Nome' htmlFor='profile-name' error={errors.name?.message}>
        <Input id='profile-name' {...register('name')} placeholder='Seu nome' className={inputClass} />
      </FormField>
      <FormField label='Como gostaria de ser chamado(a)?' htmlFor='profile-display-name' labelInfo='Opcional'>
        <Input
          id='profile-display-name'
          {...register('displayName')}
          placeholder='Nome artístico ou apelido'
          className={inputClass}
        />
      </FormField>
      <FormField label='Pronomes' htmlFor='profile-pronouns' labelInfo='Opcional'>
        <Input
          id='profile-pronouns'
          list='pronoun-options'
          {...register('pronouns')}
          placeholder='ela/dela, ele/dele, elu/delu…'
          className={inputClass}
        />
        <datalist id='pronoun-options'>
          {PRONOUN_OPTIONS.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </FormField>
      <FormField label='Gênero' labelInfo='Privado' helperText='Não aparece no seu perfil público.'>
        <ChipGroup
          options={GENDER_OPTIONS}
          selected={gender ? [gender] : []}
          onToggle={(option) => onGenderChange(option === gender ? null : (option as Gender))}
        />
      </FormField>
      <FormField label='Cidade / UF' htmlFor='profile-location' labelInfo='Opcional'>
        <Input id='profile-location' {...register('location')} placeholder='Recife, PE' className={inputClass} />
      </FormField>
      <FormField label='Bio' htmlFor='profile-bio' labelInfo='Opcional' error={errors.bio?.message}>
        <Textarea
          id='profile-bio'
          {...register('bio')}
          rows={3}
          placeholder='Fale um pouco sobre sua trajetória'
          className={cn(inputClass, 'resize-none')}
        />
      </FormField>
      <FormField label='Links' labelInfo='Opcional'>
        <div className='flex flex-col gap-2'>
          <Input {...register('instagram')} placeholder='Instagram (@usuario)' className={inputClass} />
          <Input {...register('website')} placeholder='Site' className={inputClass} />
          <Input {...register('portfolio')} placeholder='Portfólio / IMDb' className={inputClass} />
        </div>
      </FormField>
    </div>
  )
}
