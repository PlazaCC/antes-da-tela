'use client'

import { getStorageUrl } from '@/lib/utils'
import { validatePdfStructure } from '@/lib/utils/pdf'
import type { PublishFormValues } from '@/lib/validators/publish'
import { FileIcon, Image as ImageIcon, Music } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import { FileUploadField } from './file-upload-field'

interface FileStepProps {
  pdfFile: File | null
  audioFile: File | null
  coverFile: File | null
  bannerFile: File | null
  pdfStoragePath: string
  audioStoragePath: string
  coverStoragePath: string
  bannerStoragePath: string
  setValue: UseFormSetValue<PublishFormValues>
  setPdfFile: (file: File | null) => void
  setAudioFile: (file: File | null) => void
  setCoverFile: (file: File | null) => void
  setBannerFile: (file: File | null) => void
  pdfProgress: number
  audioProgress: number
  coverProgress: number
  bannerProgress: number
  pdfError: string
  audioError: string
  coverError: string
  bannerError: string
  onSetPdfError: (error: string) => void
  onSetAudioError: (error: string) => void
  onSetCoverError: (error: string) => void
  onSetBannerError: (error: string) => void
  validatePDF: (file: File) => string | null
  validateAudio: (file: File) => string | null
  validateImage: (file: File) => string | null
}

export function FileStep({
  pdfFile,
  audioFile,
  coverFile,
  bannerFile,
  pdfStoragePath,
  audioStoragePath,
  coverStoragePath,
  bannerStoragePath,
  setValue,
  setPdfFile,
  setAudioFile,
  setCoverFile,
  setBannerFile,
  pdfProgress,
  audioProgress,
  coverProgress,
  bannerProgress,
  pdfError,
  audioError,
  coverError,
  bannerError,
  onSetPdfError,
  onSetAudioError,
  onSetCoverError,
  onSetBannerError,
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
      return <Image src={previewUrl} alt='Preview' width={width} height={height} unoptimized className={className} />
    }

    if (storagePath) {
      return (
        <Image
          src={getStorageUrl('avatars', storagePath)!}
          alt='Preview'
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
    <div className='flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300'>
      <FileUploadField
        label='Arquivo do Roteiro (PDF)'
        labelInfo='Obrigatório'
        accept={{ 'application/pdf': ['.pdf'] }}
        file={pdfFile}
        error={pdfError}
        progress={pdfProgress}
        onFileDrop={async (file) => {
          const error = validatePDF(file)
          if (error) {
            onSetPdfError(error)
            return
          }

          const structureError = await validatePdfStructure(file)
          if (structureError) {
            onSetPdfError(structureError)
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

      <FileUploadField
        label='Pilotagem / Audio Drama'
        labelInfo='Opcional'
        accept={{ 'audio/*': ['.mp3', '.wav', '.m4a'] }}
        file={audioFile}
        error={audioError}
        progress={audioProgress}
        onFileDrop={(file) => {
          const error = validateAudio(file)
          if (error) {
            onSetAudioError(error)
          } else {
            setAudioFile(file)
            onSetAudioError('')
          }
        }}
        onRemove={() => {
          setAudioFile(null)
          setValue('audioStoragePath', '')
        }}
        infoText='Limite: 20MB. MP3, WAV ou M4A.'
        showExisting={!audioFile && !!audioStoragePath}
        existingFileName={renderExistingFileName(audioStoragePath)}
        preview={
          <div className='w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
            <Music size={20} />
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
          onFileDrop={(file) => {
            const error = validateImage(file)
            if (error) {
              onSetCoverError(error)
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
                'object-cover aspect-[2/3] w-12 rounded-sm bg-surface shrink-0',
              )
            ) : (
              <div className='w-12 h-18 aspect-[2/3] rounded-sm bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0'>
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
          onFileDrop={(file) => {
            const error = validateImage(file)
            if (error) {
              onSetBannerError(error)
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
