import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface FormFieldProps {
  children: ReactNode
  label: string
  htmlFor?: string
  labelInfo?: string
  helperText?: string
  error?: string
  className?: string
}

export function FormField({ children, label, htmlFor, labelInfo, helperText, error, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='flex items-end justify-between gap-3'>
        <label htmlFor={htmlFor} className='font-mono text-sm text-text-secondary uppercase tracking-wider'>
          {label}
        </label>
        {labelInfo ? (
          <span className='text-xs font-mono text-text-muted uppercase tracking-widest'>{labelInfo}</span>
        ) : null}
      </div>
      {children}
      {helperText ? <p className='text-xs font-mono text-text-muted leading-tight'>{helperText}</p> : null}
      {error ? <p className='text-state-error text-xs font-mono'>{error}</p> : null}
    </div>
  )
}
