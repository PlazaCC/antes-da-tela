import { useState } from 'react'

const MAX_PDF_BYTES = 5 * 1024 * 1024
const MAX_AUDIO_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export function validatePDF(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Apenas arquivos PDF são aceitos'
  if (file.size > MAX_PDF_BYTES) return 'O arquivo deve ter no máximo 5 MB'
  return null
}

export function validateAudio(file: File): string | null {
  if (!file.type.startsWith('audio/')) return 'Apenas arquivos de áudio são aceitos'
  if (file.size > MAX_AUDIO_BYTES) return 'O arquivo deve ter no máximo 20 MB'
  return null
}

export function validateImage(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Apenas imagens são aceitas'
  if (file.size > MAX_IMAGE_BYTES) return 'A imagem deve ter no máximo 2 MB'
  return null
}

interface UsePublishFilesResult {
  pdfFile: File | null
  audioFile: File | null
  coverFile: File | null
  bannerFile: File | null
  pdfError: string
  audioError: string
  coverError: string
  bannerError: string
  setPdfFile: (file: File | null) => void
  setAudioFile: (file: File | null) => void
  setCoverFile: (file: File | null) => void
  setBannerFile: (file: File | null) => void
  setPdfError: (value: string) => void
  setAudioError: (value: string) => void
  setCoverError: (value: string) => void
  setBannerError: (value: string) => void
  validatePDF: (file: File) => string | null
  validateAudio: (file: File) => string | null
  validateImage: (file: File) => string | null
  resetFiles: () => void
}

export function usePublishFiles(): UsePublishFilesResult {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [pdfError, setPdfError] = useState('')
  const [audioError, setAudioError] = useState('')
  const [coverError, setCoverError] = useState('')
  const [bannerError, setBannerError] = useState('')

  const resetFiles = () => {
    setPdfFile(null)
    setAudioFile(null)
    setCoverFile(null)
    setBannerFile(null)
    setPdfError('')
    setAudioError('')
    setCoverError('')
    setBannerError('')
  }

  return {
    pdfFile,
    audioFile,
    coverFile,
    bannerFile,
    pdfError,
    audioError,
    coverError,
    bannerError,
    setPdfFile,
    setAudioFile,
    setCoverFile,
    setBannerFile,
    setPdfError,
    setAudioError,
    setCoverError,
    setBannerError,
    validatePDF,
    validateAudio,
    validateImage,
    resetFiles,
  }
}
