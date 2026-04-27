'use client'

import '@ungap/with-resolvers'

import { loadPdfjsLib } from '@/lib/utils/pdf'
import { usePDFViewerStore } from './pdf-viewer-store'
import { calculateCenteredPan, calculateFitScale, clampPan, getTopOverlayHeight } from '@/lib/utils/pdf-render'
import type { PdfjsLib } from '@/lib/utils/pdf'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PdfControls } from './pdf-controls'
import { PDFViewerError } from './pdf-viewer-error'

interface PDFViewerProps {
  url: string
}

export function PDFViewerInner({ url }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null)
  const textLayerTaskRef = useRef<{ cancel: () => void } | null>(null)
  const pdfjsRef = useRef<PdfjsLib | null>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerWidthRef = useRef(0)

  const {
    currentPage,
    totalPages,
    zoom,
    isLoading,
    setCurrentPage,
    setTotalPages,
    setLoading,
  } = usePDFViewerStore()

  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const contentWidth = pageSize.width * zoom
  const contentHeight = pageSize.height * zoom

  const centerPan = useCallback(() => {
    if (!containerRef.current) return
    const cw = containerRef.current.clientWidth
    containerWidthRef.current = cw
    const centeredX = calculateCenteredPan(cw, contentWidth)
    setPan({ x: centeredX, y: 0 })
  }, [contentWidth])

  const scrollToTop = useCallback(() => {
    if (!containerRef.current) return
    const overlayHeight = getTopOverlayHeight()
    const targetScroll = window.scrollY + containerRef.current.getBoundingClientRect().top - overlayHeight
    window.scrollTo({ top: targetScroll, behavior: 'instant' })
  }, [])

  const renderPage = useCallback(
    async (pageNum: number, userZoom: number) => {
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
    },
    [],
  )

  useEffect(() => {
    setPdfError(null)
    setCurrentPage(1)
    setTotalPages(0)
    setLoading(true)
    setPan({ x: 0, y: 0 })
  }, [url, setCurrentPage, setLoading, setTotalPages])

  useEffect(() => {
    if (!containerRef.current) return
    containerWidthRef.current = containerRef.current.clientWidth
  }, [])

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
  }, [renderPage])

  useEffect(() => {
    if (pageSize.width === 0 || contentWidth === 0) return
    centerPan()
    scrollToTop()
  }, [pageSize, currentPage, centerPan, scrollToTop, contentWidth])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.preventDefault()
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        panX: pan.x,
        panY: pan.y,
      }
      setIsDragging(true)
    },
    [pan],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) return
      event.preventDefault()
      const deltaX = event.clientX - dragStartRef.current.x
      const deltaY = event.clientY - dragStartRef.current.y
      const nextX = dragStartRef.current.panX + deltaX
      const nextY = dragStartRef.current.panY + deltaY

      const containerHeight = containerRef.current?.clientHeight ?? 0
      setPan(clampPan(nextX, nextY, containerWidthRef.current, contentWidth, containerHeight, contentHeight))
    },
    [contentWidth, contentHeight],
  )

  const handlePointerUp = useCallback(() => {
    dragStartRef.current = null
    setIsDragging(false)
  }, [])

  if (pdfError) {
    return <PDFViewerError message={pdfError} />
  }

  return (
    <div className='flex flex-col'>
      <PdfControls />

      <div
        ref={containerRef}
        className='relative w-full h-[80vh] overflow-hidden touch-none'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}>
        {isLoading && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-bg-base/70 backdrop-blur-sm'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-8 h-8 rounded-full border-2 border-border-subtle border-t-brand-accent animate-spin' />
              <span className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider'>
                Carregando…
              </span>
            </div>
          </div>
        )}

        <div
          className='absolute top-0 left-0'
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}>
          <canvas
            ref={canvasRef}
            className='block rounded-sm border border-border-subtle shadow-elevation-1'
            style={{
              width: contentWidth ? `${contentWidth}px` : 'auto',
              height: contentHeight ? `${contentHeight}px` : 'auto',
            }}
            aria-label={`Página ${currentPage} de ${totalPages}`}
          />
          <div
            ref={textLayerRef}
            className='absolute inset-0 pdf-text-layer pointer-events-none'
            style={{
              width: contentWidth ? `${contentWidth}px` : 'auto',
              height: contentHeight ? `${contentHeight}px` : 'auto',
            }}
            aria-hidden='true'
          />
        </div>
      </div>
    </div>
  )
}