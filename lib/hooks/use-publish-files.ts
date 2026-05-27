import { useState } from 'react'

const MAX_PDF_BYTES = 5 * 1024 * 1024
const MAX_AUDIO_BYTES = 20 * 1024 * 1024
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export function validatePDF(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Apenas arquivos PDF são aceitos'
  if (file.size > MAX_PDF_BYTES) return 'O arquivo deve ter no máximo 5 MB'
  return null
}

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav']

export function validateAudio(file: File): string | null {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) return 'Apenas MP3 ou WAV são aceitos'
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
  pitchDeckFile: File | null
  pdfError: string
  audioError: string
  coverError: string
  bannerError: string
  pitchDeckError: string
  setPdfFile: (file: File | null) => void
  setAudioFile: (file: File | null) => void
  setCoverFile: (file: File | null) => void
  setBannerFile: (file: File | null) => void
  setPitchDeckFile: (file: File | null) => void
  setPdfError: (value: string) => void
  setAudioError: (value: string) => void
  setCoverError: (value: string) => void
  setBannerError: (value: string) => void
  setPitchDeckError: (value: string) => void
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
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null)
  const [pdfError, setPdfError] = useState('')
  const [audioError, setAudioError] = useState('')
  const [coverError, setCoverError] = useState('')
  const [bannerError, setBannerError] = useState('')
  const [pitchDeckError, setPitchDeckError] = useState('')

  const resetFiles = () => {
    setPdfFile(null)
    setAudioFile(null)
    setCoverFile(null)
    setBannerFile(null)
    setPitchDeckFile(null)
    setPdfError('')
    setAudioError('')
    setCoverError('')
    setBannerError('')
    setPitchDeckError('')
  }

  return {
    pdfFile,
    audioFile,
    coverFile,
    bannerFile,
    pitchDeckFile,
    pdfError,
    audioError,
    coverError,
    bannerError,
    pitchDeckError,
    setPdfFile,
    setAudioFile,
    setCoverFile,
    setBannerFile,
    setPitchDeckFile,
    setPdfError,
    setAudioError,
    setCoverError,
    setBannerError,
    setPitchDeckError,
    validatePDF,
    validateAudio,
    validateImage,
    resetFiles,
  }
}
