'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/ui/button'
import { useAvatarUpload } from '@/lib/hooks/use-avatar-upload'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

interface AvatarPickerProps {
  image: string | null | undefined
  name: string
  className?: string
}

/** Current avatar + "Trocar foto" (client-side upload, see useAvatarUpload). */
export function AvatarPicker({ image, name, className }: AvatarPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { upload, isUploading } = useAvatarUpload()

  return (
    <div className={cn('flex items-center gap-5 md:gap-8', className)}>
      <Avatar src={image} name={name || '?'} size='xl' />
      <Button type='button' disabled={isUploading} onClick={() => fileRef.current?.click()} variant='outline' size='sm'>
        {isUploading ? 'Enviando…' : image ? 'Trocar foto' : 'Enviar foto'}
      </Button>
      <input
        ref={fileRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void upload(file)
        }}
      />
    </div>
  )
}
