'use client'

import { MediaPlayer } from '@/components/interpreter/media-player'
import { Button } from '@/components/ui/button'
import { INTERPRETER_MEDIA, type InterpreterMediaKind } from '@/lib/constants/interpreters'
import { useInterpreterMedia, type UploadedMedia } from '@/lib/hooks/use-interpreter-media'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

interface MediaUploadFieldProps {
  kind: InterpreterMediaKind
  /** Uploaded in this session, or the current registration's media. */
  value: { previewUrl: string | null; kind: InterpreterMediaKind } | null
  onUploaded: (media: UploadedMedia) => void
  className?: string
}

export function MediaUploadField({ kind, value, onUploaded, className }: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload, progress, error } = useInterpreterMedia()
  const rules = INTERPRETER_MEDIA[kind]
  const isUploading = progress !== null
  const showPreview = value?.previewUrl && value.kind === kind
  const mediaName = kind === 'video' ? 'vídeo' : 'áudio'

  let buttonLabel = `Enviar ${mediaName}`
  if (isUploading) buttonLabel = `Enviando… ${progress}%`
  else if (showPreview) buttonLabel = 'Trocar arquivo'

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {showPreview && <MediaPlayer src={value.previewUrl} kind={kind} />}
      <div className='rounded-sm border border-dashed border-border-subtle bg-elevated p-5 flex flex-col items-center gap-2 text-center'>
        <Button type='button' variant='outline' disabled={isUploading} onClick={() => inputRef.current?.click()}>
          {buttonLabel}
        </Button>
        <p className='text-xs text-text-muted'>{rules.hint}</p>
      </div>
      {error && <p className='text-state-error text-xs font-mono'>{error}</p>}
      <input
        ref={inputRef}
        type='file'
        accept={rules.contentTypes.join(',')}
        className='hidden'
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          const media = await upload(file, kind)
          if (media) onUploaded(media)
        }}
      />
    </div>
  )
}
