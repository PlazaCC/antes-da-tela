'use client'

import { notifyError } from '@/lib/feedback'
import type { AudioEntry } from '@/lib/hooks/use-audio-entries'
import { getStorageUrl } from '@/lib/utils'
import { validatePdfStructure } from '@/lib/utils/pdf'
import type { PublishFormValues } from '@/lib/validators/publish'
import { FileIcon, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import { AudioFields } from './audio-fields'
import { FileUploadField } from './file-upload-field'

interface FileStepProps {
  pdfFile: File | null
  coverFile: File | null
  bannerFile: File | null
  pitchDeckFile: File | null
  pdfStoragePath: string
  coverStoragePath: string
  bannerStoragePath: string
  pitchDeckStoragePath: string
  setValue: UseFormSetValue<PublishFormValues>
  setPdfFile: (file: File | null) => void
  setCoverFile: (file: File | null) => void
  setBannerFile: (file: File | null) => void
  setPitchDeckFile: (file: File | null) => void
  pdfProgress: number
  coverProgress: number
  bannerProgress: number
  pitchDeckProgress: number
  pdfError: string
  coverError: string
  bannerError: string
  pitchDeckError: string
  onSetPdfError: (error: string) => void
  onSetCoverError: (error: string) => void
  onSetBannerError: (error: string) => void
  onSetPitchDeckError: (error: string) => void
  audioEntries: AudioEntry[]
  addAudioEntry: () => void
  removeAudioEntry: (id: string) => void
  updateAudioEntry: (id: string, patch: Partial<AudioEntry>) => void
  validatePDF: (file: File) => string | null
  validateAudio: (file: File) => string | null
  validateImage: (file: File) => string | null
}

export function FileStep({
  pdfFile,
  coverFile,
  bannerFile,
  pitchDeckFile,
  pdfStoragePath,
  coverStoragePath,
  bannerStoragePath,
  pitchDeckStoragePath,
  setValue,
  setPdfFile,
  setCoverFile,
  setBannerFile,
  setPitchDeckFile,
  pdfProgress,
  coverProgress,
  bannerProgress,
  pitchDeckProgress,
  pdfError,
  coverError,
  bannerError,
  pitchDeckError,
  onSetPdfError,
  onSetCoverError,
  onSetBannerError,
  onSetPitchDeckError,
  audioEntries,
  addAudioEntry,
  removeAudioEntry,
  updateAudioEntry,
  validatePDF,
  validateAudio,
  validateImage,
}: FileStepProps) {
  const coverPreviewUrl = useMemo(() => {
    return coverFile ? URL.createObjectURL(coverFile) : undefined
  }, [coverFile])

  const bannerPreviewUrl = useMemo(() => {
    return bannerFile ? URL.createObjectURL(bannerFile) : undefined
  }, [bannerFile])

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

  const renderExistingFileName = (path: string) => path.split('/').pop()

  const renderPreview = (
    previewUrl: string | undefined,
    storagePath: string,
    width: number,
    height: number,
    className: string,
  ) => {
    if (previewUrl) {
      return (
        <Image
          src={previewUrl}
          alt='Pré-visualização'
          width={width}
          height={height}
          unoptimized
          className={className}
        />
      )
    }

    if (storagePath) {
      return (
        <Image
          src={getStorageUrl('avatars', storagePath)!}
          alt='Pré-visualização'
          width={width}
          height={height}
          unoptimized
          className={className}
        />
      )
    }

    return null
  }

  return (
    <div className='flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full'>
      <FileUploadField
        label='Arquivo do Roteiro (PDF)'
        labelInfo='Obrigatório'
        accept={{ 'application/pdf': ['.pdf'] }}
        file={pdfFile}
        error={pdfError}
        progress={pdfProgress}
        onFileReject={() => {
          const msg = 'Apenas arquivos PDF são aceitos'
          onSetPdfError(msg)
          notifyError(msg)
        }}
        onFileDrop={async (file) => {
          const error = validatePDF(file)
          if (error) {
            onSetPdfError(error)
            notifyError(error)
            return
          }

          const structureError = await validatePdfStructure(file)
          if (structureError) {
            onSetPdfError(structureError)
            notifyError(structureError)
            return
          }

          setPdfFile(file)
          onSetPdfError('')
        }}
        onRemove={() => {
          setPdfFile(null)
          setValue('pdfStoragePath', '')
        }}
        infoText='Limite: 5MB. Apenas PDF.'
        showExisting={!pdfFile && !!pdfStoragePath}
        existingFileName={renderExistingFileName(pdfStoragePath)}
        preview={
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <FileIcon size={20} />
          </div>
        }
      />

      <AudioFields
        entries={audioEntries}
        addEntry={addAudioEntry}
        removeEntry={removeAudioEntry}
        updateEntry={updateAudioEntry}
        validateAudio={validateAudio}
      />

      <FileUploadField
        label='Pitch Deck'
        labelInfo='Opcional'
        accept={{ 'application/pdf': ['.pdf'] }}
        file={pitchDeckFile}
        error={pitchDeckError}
        progress={pitchDeckProgress}
        onFileReject={() => {
          const msg = 'Apenas arquivos PDF são aceitos'
          onSetPitchDeckError(msg)
          notifyError(msg)
        }}
        onFileDrop={async (file) => {
          const error = validatePDF(file)
          if (error) {
            onSetPitchDeckError(error)
            notifyError(error)
            return
          }
          setPitchDeckFile(file)
          onSetPitchDeckError('')
        }}
        onRemove={() => {
          setPitchDeckFile(null)
          setValue('pitchDeckStoragePath', '')
        }}
        infoText='Limite: 5MB. Apenas PDF.'
        showExisting={!pitchDeckFile && !!pitchDeckStoragePath}
        existingFileName={renderExistingFileName(pitchDeckStoragePath)}
        preview={
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <FileIcon size={20} />
          </div>
        }
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <FileUploadField
          label='Capa do Roteiro'
          labelInfo='Opcional'
          accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
          file={coverFile}
          error={coverError}
          progress={coverProgress}
          onFileReject={() => {
            const msg = 'Apenas imagens JPEG, PNG ou WebP são aceitas'
            onSetCoverError(msg)
            notifyError(msg)
          }}
          onFileDrop={(file) => {
            const error = validateImage(file)
            if (error) {
              onSetCoverError(error)
              notifyError(error)
            } else {
              setCoverFile(file)
              onSetCoverError('')
            }
          }}
          onRemove={() => {
            setCoverFile(null)
            setValue('coverStoragePath', '')
          }}
          infoText='Recomendado: 2:3 (600x900px). Limite: 2MB.'
          showExisting={!coverFile && !!coverStoragePath}
          existingFileName={renderExistingFileName(coverStoragePath)}
          preview={
            coverFile || coverStoragePath ? (
              renderPreview(
                coverPreviewUrl,
                coverStoragePath,
                64,
                96,
                'object-cover aspect-[4/5] w-12 rounded-sm bg-surface shrink-0',
              )
            ) : (
              <div className='w-12 h-18 aspect-[4/5] rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
                <ImageIcon size={20} />
              </div>
            )
          }
        />

        <FileUploadField
          label='Banner de Destaque'
          labelInfo='Opcional'
          accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
          file={bannerFile}
          error={bannerError}
          progress={bannerProgress}
          onFileReject={() => {
            const msg = 'Apenas imagens JPEG, PNG ou WebP são aceitas'
            onSetBannerError(msg)
            notifyError(msg)
          }}
          onFileDrop={(file) => {
            const error = validateImage(file)
            if (error) {
              onSetBannerError(error)
              notifyError(error)
            } else {
              setBannerFile(file)
              onSetBannerError('')
            }
          }}
          onRemove={() => {
            setBannerFile(null)
            setValue('bannerStoragePath', '')
          }}
          infoText='Recomendado: 16:9 (1280x720px). Limite: 2MB.'
          showExisting={!bannerFile && !!bannerStoragePath}
          existingFileName={renderExistingFileName(bannerStoragePath)}
          preview={
            bannerFile || bannerStoragePath ? (
              renderPreview(
                bannerPreviewUrl,
                bannerStoragePath,
                128,
                72,
                'object-cover aspect-video w-20 rounded-sm bg-surface shrink-0',
              )
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
