'use client'

import type { AGE_RATINGS, GENRES } from '@/lib/constants/scripts'
import { useCallback, useState } from 'react'

type Genre = (typeof GENRES)[number]
type AgeRating = (typeof AGE_RATINGS)[number]

export interface PublishFormState {
  title: string
  logline: string
  synopsis: string
  genre: Genre | ''
  ageRating: AgeRating | ''
  pdfFile: File | null
  pdfStoragePath: string
  pdfError: string
  audioFile: File | null
  audioStoragePath: string
  audioError: string
  coverFile: File | null
  coverStoragePath: string
  coverError: string
  bannerFile: File | null
  bannerStoragePath: string
  bannerError: string
}

export const INITIAL_FORM_STATE: PublishFormState = {
  title: '',
  logline: '',
  synopsis: '',
  genre: '',
  ageRating: '',
  pdfFile: null,
  pdfStoragePath: '',
  pdfError: '',
  audioFile: null,
  audioStoragePath: '',
  audioError: '',
  coverFile: null,
  coverStoragePath: '',
  coverError: '',
  bannerFile: null,
  bannerStoragePath: '',
  bannerError: '',
}

export function usePublishWizard() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PublishFormState>(INITIAL_FORM_STATE)

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 4)), [])
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), [])
  const reset = useCallback(() => setStep(1), [])

  const updateForm = useCallback((updates: Partial<PublishFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }, [])

  return {
    step,
    setStep,
    form,
    setForm,
    updateForm,
    nextStep,
    prevStep,
    reset,
  }
}
