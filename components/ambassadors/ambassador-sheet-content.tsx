import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Ambassador } from '@/content/embaixadores'
import Image from 'next/image'

interface AmbassadorSheetContentProps {
  ambassador: Ambassador
}

interface DetailListProps {
  title: string
  items: string[]
}

function DetailList({ title, items }: DetailListProps) {
  if (items.length === 0) return null
  return (
    <section className='flex flex-col gap-3'>
      <h3 className='font-mono text-label-mono-caps uppercase tracking-[0.08em] text-text-muted'>{title}</h3>
      <ul className='flex flex-col gap-2'>
        {items.map((item) => (
          <li key={item} className='border-l border-border-subtle pl-3 text-sm leading-[1.5] text-text-secondary'>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AmbassadorSheetContent({ ambassador }: AmbassadorSheetContentProps) {
  return (
    <SheetContent className='w-full gap-0 overflow-y-auto border-border-default bg-surface p-0 sm:max-w-md md:max-w-md'>
      <div className='relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-elevated'>
        <Image src={ambassador.photo} alt='' fill sizes='448px' className='object-cover object-top grayscale' />
      </div>
      <div className='flex flex-col gap-8 px-6 pb-10 pt-6'>
        <SheetHeader className='gap-2 p-0'>
          <p className='font-mono text-label-mono-caps uppercase tracking-[0.08em] text-brand-blue'>{ambassador.role}</p>
          <SheetTitle className='[font-family:var(--font-display)] text-[32px] font-medium leading-none tracking-[-0.02em] text-text-primary'>
            {ambassador.name}
          </SheetTitle>
          <SheetDescription className='text-body-default text-text-secondary'>{ambassador.bio}</SheetDescription>
        </SheetHeader>
        <DetailList title='Destaques' items={ambassador.highlights} />
        <DetailList title='Projetos atuais' items={ambassador.projects ?? []} />
        {ambassador.links.length > 0 ? (
          <ul className='flex flex-wrap gap-4'>
            {ambassador.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm font-medium text-text-primary underline underline-offset-4'
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SheetContent>
  )
}
