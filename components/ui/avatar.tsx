'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Avatar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: 'default' | 'sm' | 'lg'
}) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      data-size={size}
      className={cn(
        'group/avatar relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:h-10 data-[size=lg]:w-10 data-[size=sm]:h-6 data-[size=sm]:w-6',
        className,
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs',
        className,
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='avatar-badge'
      className={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
        'group-data-[size=sm]/avatar:h-2 group-data-[size=sm]/avatar:w-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
        'group-data-[size=default]/avatar:h-2.5 group-data-[size=default]/avatar:w-2.5 group-data-[size=default]/avatar:[&>svg]:h-2 group-data-[size=default]/avatar:[&>svg]:w-2',
        'group-data-[size=lg]/avatar:h-3 group-data-[size=lg]/avatar:w-3 group-data-[size=lg]/avatar:[&>svg]:h-2 group-data-[size=lg]/avatar:[&>svg]:w-2',
        className,
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='avatar-group'
      className={cn(
        'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
        className,
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='avatar-group-count'
      className={cn(
        'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:h-10 group-has-data-[size=lg]/avatar-group:w-10 group-has-data-[size=sm]/avatar-group:h-6 group-has-data-[size=sm]/avatar-group:w-6 [&>svg]:h-4 [&>svg]:w-4 group-has-data-[size=lg]/avatar-group:[&>svg]:h-5 group-has-data-[size=lg]/avatar-group:[&>svg]:w-5 group-has-data-[size=sm]/avatar-group:[&>svg]:h-3 group-has-data-[size=sm]/avatar-group:[&>svg]:w-3',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage }
