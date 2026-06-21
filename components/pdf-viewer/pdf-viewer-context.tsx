'use client'

import { usePdfjs } from '@/lib/hooks/use-pdfjs'
import type * as PdfjsLib from 'pdfjs-dist'
import {
  type MutableRefObject,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePDFViewerStore } from './pdf-viewer-store'

export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 3.0

interface PdfViewerContextValue {
  url: string
  // state
  currentPage: number
  totalPages: number
  zoom: number
  isLoading: boolean
  isDocumentReady: boolean
  error: Error | null
  baseDims: { width: number; height: number } | null
  // actions
  setCurrentPage: (page: number) => void
  setZoom: (next: number | ((z: number) => number)) => void
  zoomIn: () => void
  zoomOut: () => void
  goToPage: (page: number) => void
  resetError: () => void
  // shared refs (populated by PdfCanvas, read by the render effect + goToPage)
  docRef: MutableRefObject<PdfjsLib.PDFDocumentProxy | null>
  pageElRefs: MutableRefObject<Map<number, HTMLDivElement>>
  canvasRefs: MutableRefObject<Map<number, HTMLCanvasElement>>
}

const PdfViewerContext = createContext<PdfViewerContextValue | null>(null)

export function usePdfViewer(): PdfViewerContextValue {
  const ctx = useContext(PdfViewerContext)
  if (!ctx) throw new Error('usePdfViewer must be used within a <PdfViewerProvider>')
  return ctx
}

interface PdfViewerProviderProps {
  url: string
  /** Mirror the visible page to the global store (for page-scoped comments). */
  syncToStore?: boolean
  children: ReactNode
}

export function PdfViewerProvider({ url, syncToStore = false, children }: PdfViewerProviderProps) {
  const pdfjs = usePdfjs()
  const syncCurrentPage = usePDFViewerStore((s) => s.setCurrentPage)

  const docRef = useRef<PdfjsLib.PDFDocumentProxy | null>(null)
  const pageElRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())

  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoomState] = useState(1.0)
  const [currentPage, setCurrentPageState] = useState(1)
  const [baseDims, setBaseDims] = useState<{ width: number; height: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDocumentReady, setIsDocumentReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // ── Load document ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdfjs || !url) return
    const currentPdfjs = pdfjs

    setIsLoading(true)
    setError(null)
    setIsDocumentReady(false)
    setTotalPages(0)
    setCurrentPageState(1)
    setBaseDims(null)

    let cancelled = false

    async function loadPdf(): Promise<void> {
      try {
        const doc = await currentPdfjs.getDocument(url).promise
        if (cancelled) {
          doc.destroy()
          return
        }
        docRef.current = doc
        const firstPage = await doc.getPage(1)
        const viewport = firstPage.getViewport({ scale: 1 })
        if (cancelled) return
        setBaseDims({ width: viewport.width, height: viewport.height })
        setTotalPages(doc.numPages)
        setIsDocumentReady(true)
        setIsLoading(false)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    }

    loadPdf()

    return () => {
      cancelled = true
      docRef.current?.destroy()
      docRef.current = null
      setIsDocumentReady(false)
    }
  }, [pdfjs, url])

  const setCurrentPage = useCallback(
    (page: number) => {
      setCurrentPageState(page)
      if (syncToStore) syncCurrentPage(page)
    },
    [syncToStore, syncCurrentPage],
  )

  const setZoom = useCallback((next: number | ((z: number) => number)) => {
    setZoomState((prev) => {
      const raw = typeof next === 'function' ? next(prev) : next
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(raw * 4) / 4))
    })
  }, [])

  const zoomIn = useCallback(() => setZoom((z) => z + 0.25), [setZoom])
  const zoomOut = useCallback(() => setZoom((z) => z - 0.25), [setZoom])

  const goToPage = useCallback(
    (target: number) => {
      const clamped = Math.max(1, Math.min(totalPages, target))
      pageElRefs.current.get(clamped)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [totalPages],
  )

  const resetError = useCallback(() => setError(null), [])

  const value = useMemo<PdfViewerContextValue>(
    () => ({
      url,
      currentPage,
      totalPages,
      zoom,
      isLoading,
      isDocumentReady,
      error,
      baseDims,
      setCurrentPage,
      setZoom,
      zoomIn,
      zoomOut,
      goToPage,
      resetError,
      docRef,
      pageElRefs,
      canvasRefs,
    }),
    [
      url,
      currentPage,
      totalPages,
      zoom,
      isLoading,
      isDocumentReady,
      error,
      baseDims,
      setCurrentPage,
      setZoom,
      zoomIn,
      zoomOut,
      goToPage,
      resetError,
    ],
  )

  return <PdfViewerContext.Provider value={value}>{children}</PdfViewerContext.Provider>
}
