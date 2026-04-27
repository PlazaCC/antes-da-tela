'use client'

import '@ungap/with-resolvers'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import { loadPdfjsLib } from '@/lib/utils/pdf'
import type { PdfjsLib } from '@/lib/utils/pdf'
import { calculateFitScale } from '@/lib/utils/pdf-render'
import { usePDFViewerStore } from './pdf-viewer-store'

export function usePDFRender(
  url: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  textLayerRef: React.RefObject<HTMLDivElement | null>,
): {
  pdfError: string | null
  setPdfError: React.Dispatch<React.SetStateAction<string | null>>
  pageSize: { width: number; height: number }
  setPageSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>
  containerWidthRef: React.MutableRefObject<number>
  renderPage: (pageNum: number, userZoom: number) => Promise<void>
  isDocLoaded: boolean
} {
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)
  const pdfjsRef = useRef<PdfjsLib | null>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
  const textLayerTaskRef = useRef<{ cancel: () => void } | null>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerWidthRef = useRef(0)

  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 })
  const [isDocLoaded, setIsDocLoaded] = useState(false)

  const { currentPage, zoom, setCurrentPage, setTotalPages, setLoading } = usePDFViewerStore()

  const renderPage = useCallback(async (pageNum: number, userZoom: number) => {
    if (
      !canvasRef.current ||
      !containerRef.current ||
      !textLayerRef.current ||
      !pdfDocRef.current ||
      !pdfjsRef.current ||
      !containerWidthRef.current
    )
      return

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }
    if (textLayerTaskRef.current) {
      textLayerTaskRef.current.cancel()
      textLayerTaskRef.current = null
    }

    const page = (await pdfDocRef.current.getPage(pageNum)) as PDFPageProxy
    const naturalViewport = page.getViewport({ scale: 1 }) as PageViewport
    const scale = calculateFitScale(containerWidthRef.current, naturalViewport.width, userZoom)
    const viewport = page.getViewport({ scale }) as PageViewport
    const canvas = canvasRef.current
    const outputScale = window.devicePixelRatio || 1

    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    const context = canvas.getContext('2d')
    if (!context) return

    if (typeof context.resetTransform === 'function') {
      context.resetTransform()
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0)
    }
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)

    const renderTask = page.render({ canvasContext: context, viewport, canvas })
    renderTaskRef.current = renderTask

    try {
      await renderTask.promise
      setPageSize({ width: viewport.width, height: viewport.height })
    } catch (err) {
      if (err instanceof Error) {
        setPdfError(err.message)
      } else {
        setPdfError('Falha ao renderizar o PDF.')
      }
      pdfDocRef.current = null
      return
    } finally {
      renderTaskRef.current = null
    }

    if (textLayerRef.current) {
      const container = textLayerRef.current
      container.innerHTML = ''
      container.style.width = `${Math.floor(viewport.width)}px`
      container.style.height = `${Math.floor(viewport.height)}px`

      try {
        const tl = new pdfjsRef.current!.TextLayer({
          textContentSource: page.streamTextContent(),
          container,
          viewport,
        })
        textLayerTaskRef.current = tl
        await tl.render()
      } catch {
        // text layer cancelled or unsupported
      } finally {
        textLayerTaskRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPdfError(null)
    setCurrentPage(1)
    setTotalPages(0)
    setLoading(true)
  }, [url, setCurrentPage, setLoading, setTotalPages])

  useEffect(() => {
    if (!containerRef.current) return
    containerWidthRef.current = containerRef.current.clientWidth
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false

    async function loadPDF() {
      setLoading(true)
      setPdfError(null)
      setCurrentPage(1)
      setTotalPages(0)

      const pdfjsLib = await loadPdfjsLib()
      pdfjsRef.current = pdfjsLib

      const pdf = await pdfjsLib.getDocument(url).promise
      if (cancelled) {
        pdf.destroy?.()
        return
      }

      pdfDocRef.current = pdf
      setTotalPages(pdf.numPages)
      setIsDocLoaded(true)
      setLoading(false)

      const state = usePDFViewerStore.getState()
      await renderPage(1, state.zoom)
    }

    loadPDF().catch((err) => {
      console.error(err)
      if (!cancelled) {
        setPdfError(err instanceof Error ? err.message : 'Falha ao carregar o PDF.')
        setLoading(false)
        pdfDocRef.current = null
        setTotalPages(0)
        setIsDocLoaded(false)
      }
    })
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  useEffect(() => {
    if (!pdfDocRef.current) return
    const state = usePDFViewerStore.getState()
    renderPage(state.currentPage, state.zoom)
  }, [currentPage, renderPage])

  useEffect(() => {
    if (!pdfDocRef.current) return
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    zoomTimerRef.current = setTimeout(() => {
      const state = usePDFViewerStore.getState()
      renderPage(state.currentPage, state.zoom)
    }, 300)
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
    }
  }, [zoom, renderPage])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => {
      if (!pdfDocRef.current || !containerRef.current) return
      containerWidthRef.current = containerRef.current.clientWidth
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(() => {
        const state = usePDFViewerStore.getState()
        renderPage(state.currentPage, state.zoom)
      }, 150)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [renderPage]) // eslint-disable-line react-hooks/exhaustive-deps

  return { pdfError, setPdfError, pageSize, setPageSize, containerWidthRef, renderPage, isDocLoaded }
}
