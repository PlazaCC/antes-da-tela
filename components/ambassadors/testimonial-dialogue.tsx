import type { Testimonial } from '@/content/embaixadores'
import { cn } from '@/lib/utils'
import { screenplayFont } from './screenplay-font'

interface TestimonialDialogueProps {
  testimonial: Testimonial
  className?: string
}

/** Depoimento formatado como diálogo de roteiro: personagem, rubrica e fala. */
export function TestimonialDialogue({ testimonial, className }: TestimonialDialogueProps) {
  return (
    <figure
      className={cn(
        screenplayFont.className,
        'flex h-full flex-col items-center rounded-lg border border-border-default bg-surface px-6 py-8 md:px-[72px] md:py-12',
        className,
      )}
    >
      <figcaption className='flex flex-col items-center text-center'>
        <span className='text-base font-bold uppercase tracking-[0.04em] text-text-primary'>{testimonial.author}</span>
        <span className='text-sm text-text-muted'>({testimonial.company})</span>
      </figcaption>
      <blockquote className='mt-4 w-full text-[17px] leading-[1.5] text-text-primary md:text-lg'>
        <p>{testimonial.quote}</p>
      </blockquote>
    </figure>
  )
}
