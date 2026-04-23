'use client'

import type { PublishFormState } from '@/lib/hooks/use-publish-wizard'
import { getStorageUrl } from '@/lib/utils'
import { FileIcon, Image as ImageIcon, Music } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import { FileUploadField } from './file-upload-field'

interface FileStepProps {
  form: PublishFormState
  updateForm: (updates: Partial<PublishFormState>) => void
  pdfProgress: number
  audioProgress: number
  coverProgress: number
  bannerProgress: number
  validatePDF: (file: File) => string | null
  validateAudio: (file: File) => string | null
  validateImage: (file: File) => string | null
}

export function FileStep({
  form,
  updateForm,
  pdfProgress,
  audioProgress,
  coverProgress,
  bannerProgress,
  validatePDF,
  validateAudio,
  validateImage,
}: FileStepProps) {
  const coverPreviewUrl = useMemo(() => {
    return form.coverFile ? URL.createObjectURL(form.coverFile) : undefined
  }, [form.coverFile])

  const bannerPreviewUrl = useMemo(() => {
    return form.bannerFile ? URL.createObjectURL(form.bannerFile) : undefined
  }, [form.bannerFile])

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl)
    }
  }, [coverPreviewUrl])

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl)
    }
  }, [bannerPreviewUrl])

  return (
    <div className='flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      {/* PDF Upload */}
      <FileUploadField
        label='Arquivo do Roteiro (PDF)'
        labelInfo='Obrigatório'
        accept={{ 'application/pdf': ['.pdf'] }}
        file={form.pdfFile}
        error={form.pdfError}
        progress={pdfProgress}
        onFileDrop={(file) => {
          const error = validatePDF(file)
          if (error) updateForm({ pdfError: error })
          else updateForm({ pdfFile: file, pdfError: '' })
        }}
        onRemove={() => updateForm({ pdfFile: null, pdfStoragePath: '' })}
        infoText='Limite: 5MB. Apenas PDF.'
        showExisting={!form.pdfFile && !!form.pdfStoragePath}
        existingFileName={form.pdfStoragePath.split('/').pop()}
        preview={
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <FileIcon size={20} />
          </div>
        }
      />

      {/* Audio Upload */}
      <FileUploadField
        label='Pilotagem / Audio Drama'
        labelInfo='Opcional'
        accept={{ 'audio/*': ['.mp3', '.wav', '.m4a'] }}
        file={form.audioFile}
        error={form.audioError}
        progress={audioProgress}
        onFileDrop={(file) => {
          const error = validateAudio(file)
          if (error) updateForm({ audioError: error })
          else updateForm({ audioFile: file, audioError: '' })
        }}
        onRemove={() => updateForm({ audioFile: null, audioStoragePath: '' })}
        infoText='Limite: 20MB. MP3, WAV ou M4A.'
        showExisting={!form.audioFile && !!form.audioStoragePath}
        existingFileName={form.audioStoragePath.split('/').pop()}
        preview={
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <Music size={20} />
          </div>
        }
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Cover Upload */}
        <FileUploadField
          label='Capa do Roteiro'
          labelInfo='Opcional'
          accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
          file={form.coverFile}
          error={form.coverError}
          progress={coverProgress}
          onFileDrop={(file) => {
            const error = validateImage(file)
            if (error) updateForm({ coverError: error })
            else updateForm({ coverFile: file, coverError: '' })
          }}
          onRemove={() => updateForm({ coverFile: null, coverStoragePath: '' })}
          infoText='Recomendado: 2:3 (600x900px). Limite: 2MB.'
          showExisting={!form.coverFile && !!form.coverStoragePath}
          existingFileName={form.coverStoragePath.split('/').pop()}
          preview={
            form.coverFile ? (
              <Image
                src={coverPreviewUrl ?? ''}
                alt='Cover preview'
                width={64}
                height={96}
                unoptimized
                className='object-cover aspect-[2/3] w-12 rounded-sm bg-surface shrink-0'
              />
            ) : form.coverStoragePath ? (
              // Intentional client-side preview only for public avatars bucket URLs.
              <Image
                src={getStorageUrl('avatars', form.coverStoragePath)!}
                alt='Cover preview'
                width={64}
                height={96}
                unoptimized
                className='object-cover aspect-[2/3] w-12 rounded-sm bg-surface shrink-0'
              />
            ) : (
              <div className='w-12 h-18 aspect-[2/3] rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
                <ImageIcon size={20} />
              </div>
            )
          }
        />

        {/* Banner Upload */}
        <FileUploadField
          label='Banner de Destaque'
          labelInfo='Opcional'
          accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
          file={form.bannerFile}
          error={form.bannerError}
          progress={bannerProgress}
          onFileDrop={(file) => {
            const error = validateImage(file)
            if (error) updateForm({ bannerError: error })
            else updateForm({ bannerFile: file, bannerError: '' })
          }}
          onRemove={() => updateForm({ bannerFile: null, bannerStoragePath: '' })}
          infoText='Recomendado: 16:9 (1280x720px). Limite: 2MB.'
          showExisting={!form.bannerFile && !!form.bannerStoragePath}
          existingFileName={form.bannerStoragePath.split('/').pop()}
          preview={
            form.bannerFile ? (
              <Image
                src={bannerPreviewUrl ?? ''}
                alt='Banner preview'
                width={128}
                height={72}
                unoptimized
                className='object-cover aspect-video w-20 rounded-sm bg-surface shrink-0'
              />
            ) : form.bannerStoragePath ? (
              // Intentional client-side preview only for public avatars bucket URLs.
              <Image
                src={getStorageUrl('avatars', form.bannerStoragePath)!}
                alt='Banner preview'
                width={128}
                height={72}
                unoptimized
                className='object-cover aspect-video w-20 rounded-sm bg-surface shrink-0'
              />
            ) : (
              <div className='w-20 aspect-video rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
                <ImageIcon size={20} />
              </div>
            )
          }
        />
      </div>
    </div>
  )
}
