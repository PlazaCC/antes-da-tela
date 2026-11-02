'use client'

import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import type { Ambassador } from '@/content/embaixadores'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { AmbassadorSheetContent } from './ambassador-sheet-content'

interface AmbassadorCardProps {
  ambassador: Ambassador
  className?: string
}

/** Card do elenco; o clique abre a bio completa num painel lateral. */
export function AmbassadorCard({ ambassador, className }: AmbassadorCardProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type='button'
          className={cn(
            'group flex h-full flex-col overflow-hidden rounded-lg border border-border-default bg-surface text-left outline-none transition-colors hover:border-border-subtle focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
        >
          <span className='relative block aspect-[4/5] w-full overflow-hidden bg-elevated'>
            <Image
              src={ambassador.photo}
              alt={`Foto de ${ambassador.name}`}
              fill
              sizes='(min-width: 1280px) 282px, (min-width: 768px) 45vw, 78vw'
              className='object-cover grayscale transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none'
            />
          </span>
          <span className='flex flex-1 flex-col gap-3 px-5 pb-6 pt-5'>
            <span className='font-mono text-label-mono-caps uppercase tracking-[0.08em] text-brand-blue'>{ambassador.role}</span>
            <span className='[font-family:var(--font-display)] text-[28px] font-medium leading-[1.05] tracking-[-0.02em] text-text-primary'>
              {ambassador.name}
            </span>
            <span className='text-sm leading-[1.5] text-text-secondary'>{ambassador.tagline}</span>
            <span className='flex flex-wrap gap-1.5'>
              {ambassador.highlights.slice(0, 2).map((highlight) => (
                <span
                  key={highlight}
                  className='rounded-pill border border-border-default px-2 py-1 font-mono text-label-mono-caps text-text-secondary'
                >
                  {highlight}
                </span>
              ))}
            </span>
            <span className='mt-auto pt-1 text-sm font-medium text-text-primary underline underline-offset-4'>
              Ler bio completa →
            </span>
          </span>
        </button>
      </SheetTrigger>
      <AmbassadorSheetContent ambassador={ambassador} />
    </Sheet>
  )
}
