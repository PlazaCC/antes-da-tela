'use client'

import { AGE_RATINGS, formatAgeRating, GENRES } from '@/lib/constants/scripts'
import { cn } from '@/lib/utils'
import type { PublishFormValues } from '@/lib/validators/publish'
import type { UseFormSetValue } from 'react-hook-form'

interface GenreStepProps {
  genre: PublishFormValues['genre']
  ageRating: PublishFormValues['ageRating']
  setValue: UseFormSetValue<PublishFormValues>
}

export function GenreStep({ genre, ageRating, setValue }: GenreStepProps) {
  return (
    <div className='flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <div className='flex flex-col gap-4'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Gênero Predominante
        </label>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
          {GENRES.map((item) => (
            <button
              key={item}
              type='button'
              onClick={() => setValue('genre', item)}
              className={cn(
                'h-10 px-4 rounded-sm border text-xs font-medium transition-all text-left truncate',
                genre === item
                  ? 'border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent'
                  : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
              )}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Classificação Indicativa
        </label>
        <div className='grid grid-cols-2 md:grid-cols-3 md:grid-cols-6 gap-2'>
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
      </div>
    </div>
  )
}
