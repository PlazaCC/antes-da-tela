'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const v = Math.max(0, Math.min(100, Number(value ?? 0)))
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className='h-full bg-primary transition-all'
        style={{ width: `${v}%` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
