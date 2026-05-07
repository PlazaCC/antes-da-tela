'use client'

import { getPdfjs } from '@/lib/utils/pdf'
import type * as PdfjsLib from 'pdfjs-dist'
import { useEffect, useState } from 'react'

export function usePdfjs() {
  const [pdfjs, setPdfjs] = useState<typeof PdfjsLib | null>(null)

  useEffect(() => {
    let cancelled = false

    getPdfjs().then((result) => {
      if (!cancelled) {
        setPdfjs(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return pdfjs
}
