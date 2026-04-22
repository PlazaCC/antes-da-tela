'use client'

import { GENRES, AGE_RATINGS, formatAgeRating } from '@/lib/constants/scripts'
import { cn } from '@/lib/utils'
import type { PublishFormState } from '@/lib/hooks/use-publish-wizard'

interface GenreStepProps {
  form: PublishFormState
  updateForm: (updates: Partial<PublishFormState>) => void
}

export function GenreStep({ form, updateForm }: GenreStepProps) {
  return (
    <div className='flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <div className='flex flex-col gap-4'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Gênero Predominante
        </label>
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
          {GENRES.map((genre) => (
            <button
              key={genre}
              type='button'
              onClick={() => updateForm({ genre })}
              className={cn(
                'h-10 px-4 rounded-sm border text-xs font-medium transition-all text-left truncate',
                form.genre === genre
                  ? 'border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent'
                  : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          Classificação Indicativa
        </label>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2'>
          {AGE_RATINGS.map((rating) => (
            <button
              key={rating}
              type='button'
              onClick={() => updateForm({ ageRating: rating })}
              className={cn(
                'h-10 px-3 rounded-sm border text-xs font-mono font-medium transition-all flex items-center justify-center',
                form.ageRating === rating
                  ? 'border-brand-accent bg-brand-accent/5 text-brand-accent ring-1 ring-brand-accent'
                  : 'border-border-subtle bg-elevated text-text-muted hover:border-text-muted hover:text-text-secondary',
              )}
            >
              {formatAgeRating(rating)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
