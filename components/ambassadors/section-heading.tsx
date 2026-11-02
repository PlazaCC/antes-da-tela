import { cn } from '@/lib/utils'

interface AmbassadorsSectionHeadingProps {
  id: string
  title: string
  intro?: string
  className?: string
}

export function AmbassadorsSectionHeading({ id, title, intro, className }: AmbassadorsSectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12', className)}>
      <h2 id={id} className='[font-family:var(--font-display)] text-[36px] font-medium leading-none tracking-[-0.03em] text-text-primary md:text-[56px]'>
        {title}
      </h2>
      {intro ? <p className='max-w-[420px] text-body-default text-text-secondary'>{intro}</p> : null}
    </div>
  )
}
