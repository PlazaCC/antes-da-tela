import { fakerPT_BR } from '@faker-js/faker'
import { AGE_RATINGS, GENRES } from '@/lib/constants/scripts'
import type { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import { isDevToolsEnabled } from './dev-tools'

// Return a small, realistic mock for the publish form. Deterministic seed for repeatability.
export type PublishFormState = {
  title: string
  logline: string
  synopsis: string
  genre: string | ''
  ageRating: string | ''
  pdfFile: File | null
  pdfStoragePath: string
  pdfError: string
}

export function getPublishFormMock(): Partial<PublishFormState> {
  const f = fakerPT_BR
  f.seed(42)

  const title = `${f.word.words(2)} ${f.word.words(1)}`
  const logline = f.lorem.sentence(8)
  const synopsis = f.lorem.paragraphs(2)
  const genre = f.helpers.arrayElement(GENRES)
  const ageRating = f.helpers.arrayElement(AGE_RATINGS)

  return { title, logline, synopsis, genre, ageRating }
}

// Hook: auto-fill publish form in development. Simple and self-contained.
export function useAutoFillPublishForm<T extends Record<string, unknown>>(setForm: Dispatch<SetStateAction<T>>) {
  useEffect(() => {
    if (!isDevToolsEnabled()) return

    const mock = getPublishFormMock()

    // Create a tiny in-memory PDF file for local testing.
    let file: File | null = null
    try {
      const blob = new Blob(['%PDF-1.4\n%Mock PDF\n'], { type: 'application/pdf' })
      file = new File([blob], `exemplo-roteiro-${Date.now()}.pdf`, { type: 'application/pdf' })
    } catch {
      file = null
    }

    setForm(() => {
      const next = {
        title: mock.title ?? '',
        logline: mock.logline ?? '',
        synopsis: mock.synopsis ?? '',
        genre: mock.genre ?? '',
        ageRating: mock.ageRating ?? '',
        pdfFile: file ?? null,
        pdfStoragePath: '',
        pdfError: '',
      } as unknown as T

      return next
    })
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
