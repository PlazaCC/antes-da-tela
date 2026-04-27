'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateCenteredPan, clampPan, getTopOverlayHeight } from '@/lib/utils/pdf-render'
import { usePDFViewerStore } from './pdf-viewer-store'

export function usePDFPan(
  containerRef: React.RefObject<HTMLDivElement | null>,
  containerWidthRef: React.MutableRefObject<number>,
  contentWidth: number,
  contentHeight: number,
  pageSize: { width: number; height: number },
): {
  pan: { x: number; y: number }
  isDragging: boolean
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  handlePointerUp: () => void
} {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const { currentPage } = usePDFViewerStore()

  const centerPan = useCallback(() => {
    if (!containerRef.current) return
    const cw = containerRef.current.clientWidth
    containerWidthRef.current = cw
    const centeredX = calculateCenteredPan(cw, contentWidth)
    setPan({ x: centeredX, y: 0 })
  }, [containerRef, containerWidthRef, contentWidth])

  const scrollToTop = useCallback(() => {
    if (!containerRef.current) return
    const overlayHeight = getTopOverlayHeight()
    const targetScroll = window.scrollY + containerRef.current.getBoundingClientRect().top - overlayHeight
    window.scrollTo({ top: targetScroll, behavior: 'instant' })
  }, [containerRef])

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
    [containerRef, containerWidthRef, contentWidth, contentHeight],
  )

  const handlePointerUp = useCallback(() => {
    dragStartRef.current = null
    setIsDragging(false)
  }, [])

  return { pan, isDragging, handlePointerDown, handlePointerMove, handlePointerUp }
}
