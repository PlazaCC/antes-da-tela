import { useState } from 'react'

interface UsePublishUploadProgressResult {
  pdfProgress: number
  audioProgress: number
  coverProgress: number
  bannerProgress: number
  uploading: boolean
  uploadError: string
  setPdfProgress: (value: number) => void
  setAudioProgress: (value: number) => void
  setCoverProgress: (value: number) => void
  setBannerProgress: (value: number) => void
  setUploading: (value: boolean) => void
  setUploadError: (value: string) => void
  resetProgress: () => void
}

export function usePublishUploadProgress(): UsePublishUploadProgressResult {
  const [pdfProgress, setPdfProgress] = useState(0)
  const [audioProgress, setAudioProgress] = useState(0)
  const [coverProgress, setCoverProgress] = useState(0)
  const [bannerProgress, setBannerProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const resetProgress = () => {
    setPdfProgress(0)
    setAudioProgress(0)
    setCoverProgress(0)
    setBannerProgress(0)
    setUploading(false)
    setUploadError('')
  }

  return {
    pdfProgress,
    audioProgress,
    coverProgress,
    bannerProgress,
    uploading,
    uploadError,
    setPdfProgress,
    setAudioProgress,
    setCoverProgress,
    setBannerProgress,
    setUploading,
    setUploadError,
    resetProgress,
  }
}
