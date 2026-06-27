'use client'

import { SubgenreSelector } from '@/components/publish/subgenre-selector'
import { FormField } from '@/components/shared/form-field'
import { AGE_RATINGS, formatAgeRating, GENRES, MACRO_GENRES, MAX_SUBGENRES } from '@/lib/constants/scripts'
import { cn } from '@/lib/utils'
import type { PublishFormValues } from '@/lib/validators/publish'
import type { UseFormSetValue } from 'react-hook-form'

interface GenreStepProps {
  genre: PublishFormValues['genre']
  subgenres: PublishFormValues['subgenres']
  ageRating: PublishFormValues['ageRating']
  setValue: UseFormSetValue<PublishFormValues>
}

export function GenreStep({ genre, subgenres, ageRating, setValue }: GenreStepProps) {
  const selectPrimary = (item: (typeof MACRO_GENRES)[number]) => {
    setValue('genre', item)
    if (subgenres.includes(item)) {
      setValue('subgenres', subgenres.filter((s) => s !== item), { shouldDirty: true })
    }
  }

  const toggleSubgenre = (item: (typeof GENRES)[number]) => {
    const isSelected = subgenres.includes(item)
    if (isSelected) {
      setValue('subgenres', subgenres.filter((s) => s !== item), { shouldDirty: true })
      return
    }
    if (subgenres.length >= MAX_SUBGENRES) return
    setValue('subgenres', [...subgenres, item], { shouldDirty: true })
  }

  return (
    <div className='flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <FormField label='Gênero Principal'>
        {!genre ? (
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
            {MACRO_GENRES.map((item) => (
              <button
                key={item}
                type='button'
                onClick={() => selectPrimary(item)}
                className='h-10 px-4 rounded-sm border border-border-subtle bg-elevated text-xs font-medium text-text-muted transition-all text-left truncate hover:border-text-muted hover:text-text-secondary capitalize'>
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <span className='h-10 px-4 rounded-sm border border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent text-xs font-medium flex items-center capitalize'>
              {genre}
            </span>
            <button
              type='button'
              onClick={() => {
                setValue('genre', '')
                setValue('subgenres', [], { shouldDirty: true })
              }}
              className='text-xs text-text-muted hover:text-text-secondary underline underline-offset-2'>
              Trocar
            </button>
          </div>
        )}
      </FormField>

      {genre && (
        <FormField
          label='Subgêneros'
          labelInfo={`Até ${MAX_SUBGENRES}`}
          helperText={`Selecionados: ${subgenres.length}/${MAX_SUBGENRES}`}>
          <SubgenreSelector genre={genre} subgenres={subgenres} onToggle={toggleSubgenre} />
        </FormField>
      )}

      <FormField label='Classificação Indicativa'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2'>
          {AGE_RATINGS.map((rating) => (
            <button
              key={rating}
              type='button'
              onClick={() => setValue('ageRating', rating)}
              className={cn(
                'h-10 px-3 rounded-sm border text-xs font-mono font-medium transition-all flex items-center justify-center',
                ageRating === rating
                  ? 'border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent'
                  : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
              )}>
              {formatAgeRating(rating)}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  )
}
