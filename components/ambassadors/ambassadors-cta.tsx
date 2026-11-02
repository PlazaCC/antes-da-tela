import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { screenplayFont } from './screenplay-font'

export function AmbassadorsCta() {
  return (
    <section aria-labelledby='embaixadores-cta' className='border-t border-border-default bg-surface px-4 py-14 md:py-24'>
      <div className='mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center md:gap-7'>
        <p className={cn(screenplayFont.className, 'text-sm font-bold uppercase tracking-[0.04em] text-text-muted')}>
          Luca Paiva Mello (V.O.)
        </p>
        <h2
          id='embaixadores-cta'
          className='max-w-[820px] [font-family:var(--font-display)] text-[36px] font-medium leading-none tracking-[-0.03em] text-text-primary md:text-[64px]'
        >
          Você pode ser o curador do próximo sucesso.
        </h2>
        <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
          <Button asChild size='lg'>
            <Link href='/feed'>Explorar roteiros</Link>
          </Button>
          <Button asChild size='lg' variant='outline'>
            <Link href='/publish'>Publicar meu roteiro</Link>
          </Button>
        </div>
        <p className={cn(screenplayFont.className, 'mt-6 self-end text-base font-bold uppercase tracking-[0.04em] text-text-primary')}>
          Fade out.
        </p>
      </div>
    </section>
  )
}
