'use client'

import { ChipGroup } from '@/components/preferences/chip-group'
import { FormField } from '@/components/shared/form-field'
import {
  PREFERENCE_FORMATS,
  PREFERENCE_GENRES,
  PREFERENCE_GOALS,
  PREFERENCE_THEMES,
} from '@/lib/constants/preferences'
import type { PreferenceKey } from '@/lib/hooks/use-preferences-form'
import { cn } from '@/lib/utils'

const GROUPS: ReadonlyArray<{ key: PreferenceKey; label: string; options: readonly string[] }> = [
  { key: 'genres', label: 'Gêneros', options: PREFERENCE_GENRES },
  { key: 'formats', label: 'Formatos', options: PREFERENCE_FORMATS },
  { key: 'themes', label: 'Temas', options: PREFERENCE_THEMES },
  { key: 'goals', label: 'O que te traz aqui?', options: PREFERENCE_GOALS },
]

interface PreferencesFieldsProps {
  values: Record<PreferenceKey, string[]>
  onToggle: (key: PreferenceKey, option: string) => void
  className?: string
}

export function PreferencesFields({ values, onToggle, className }: PreferencesFieldsProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {GROUPS.map((group) => (
        <FormField key={group.key} label={group.label} labelInfo='Opcional'>
          <ChipGroup
            options={group.options}
            selected={values[group.key]}
            onToggle={(option) => onToggle(group.key, option)}
          />
        </FormField>
      ))}
    </div>
  )
}
