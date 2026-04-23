'use client'

import { DragZone } from '@/components/drag-zone/drag-zone'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface FileUploadFieldProps {
  label: string
  labelInfo?: string
  accept: Record<string, string[]>
  file: File | null
  error: string | null
  progress: number
  onFileDrop: (file: File) => void
  onRemove: () => void
  preview?: ReactNode
  className?: string
  infoText?: string
  showExisting?: boolean
  existingFileName?: string
}

export function FileUploadField({
  label,
  labelInfo,
  accept,
  file,
  error,
  progress,
  onFileDrop,
  onRemove,
  preview,
  className,
  infoText,
  showExisting,
  existingFileName,
}: FileUploadFieldProps) {
  const hasFile = !!file || showExisting

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className='flex justify-between items-end'>
        <label className='font-mono text-label-mono-caps text-text-secondary uppercase tracking-wider text-xs'>
          {label}
        </label>
        {labelInfo && (
          <span className='text-[10px] font-mono text-text-muted uppercase tracking-widest'>
            {labelInfo}
          </span>
        )}
      </div>

      {!hasFile ? (
        <DragZone
          accept={accept}
          maxFiles={1}
          onFilesDrop={(files) => {
            const file = files[0]
            if (file) onFileDrop(file)
          }}
          className={cn(error && 'border-state-error/50 bg-state-error/5')}
        />
      ) : (
        <div className='bg-elevated border border-border-subtle rounded-sm p-4 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200'>
          <div className='flex items-center gap-4 overflow-hidden'>
            {preview}
            <div className='flex flex-col overflow-hidden'>
              <span className='text-body-small font-medium text-text-primary truncate'>
                {file ? file.name : existingFileName || 'Arquivo existente'}
              </span>
              <span className='text-xs text-text-muted'>
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Enviado anteriormente'}
              </span>
            </div>
          </div>
          <button
            onClick={onRemove}
            className='p-2 hover:bg-surface-hover text-text-muted hover:text-state-error transition-colors rounded-sm shrink-0'
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {infoText && !hasFile && !error && (
        <p className='text-[10px] font-mono text-text-muted uppercase leading-tight'>
          {infoText}
        </p>
      )}

      {error && <p className='text-state-error text-xs font-mono'>{error}</p>}

      {progress > 0 && progress < 100 && (
        <div className='flex flex-col gap-1.5'>
          <div className='flex justify-between text-[10px] font-mono text-text-muted uppercase'>
            <span>Enviando...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className='h-1' />
        </div>
      )}
    </div>
  )
}
