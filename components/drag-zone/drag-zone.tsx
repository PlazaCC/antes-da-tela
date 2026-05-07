'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'
import { useDropzone, type Accept } from 'react-dropzone'

export interface DragZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  onFilesDrop?: (files: File[]) => void
  accept?: Accept
  maxFiles?: number
}

export const DragZone = React.forwardRef<HTMLDivElement, DragZoneProps>(
  ({ className, title = 'Arraste e solte os arquivos aqui', subtitle = 'ou clique para selecionar', onFilesDrop, accept, maxFiles, ...props }, ref) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: onFilesDrop,
      accept,
      maxFiles,
    })

    const { ref: rootRef, ...rootProps } = getRootProps()

    return (
      <div
        {...rootProps}
        ref={(node) => {
          // Merge refs
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
          rootRef.current = node
        }}
        aria-label={isDragActive ? 'Solte os arquivos aqui' : title}
        className={cn(
          'rounded-sm border border-dashed border-border-subtle bg-elevated px-6 py-10 text-center transition cursor-pointer',
          'hover:border-brand-accent/80 hover:bg-surface',
          isDragActive && 'border-brand-accent bg-brand-accent/10',
          className
        )}
        {...props}
      >
        <input {...getInputProps()} />
        <p className='text-body-default font-medium text-text-primary'>
          {isDragActive ? 'Solte os arquivos aqui' : title}
        </p>
        <p className='mt-1 text-xs text-text-muted font-mono uppercase tracking-wider'>{subtitle}</p>
      </div>
    )
  }
)
DragZone.displayName = 'DragZone'
