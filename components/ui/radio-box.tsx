import { cn } from '@/lib/utils'
import * as React from 'react'

export interface RadioBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
}

export function RadioBox({ className, label, description, ...props }: RadioBoxProps) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-start justify-between gap-4 rounded-3xl border border-border bg-background p-4 transition hover:border-accent hover:bg-surface',
        className,
      )}>
      <div>
        <span className='text-sm font-semibold text-foreground'>{label}</span>
        {description ? <p className='mt-1 text-sm text-muted-foreground'>{description}</p> : null}
      </div>
      <input
        type='radio'
        className='mt-1 h-4 w-4 appearance-none rounded-full border border-muted/70 bg-background checked:border-accent checked:bg-accent focus:outline-none focus:ring-2 focus:ring-accent'
        {...props}
      />
    </label>
  )
}
