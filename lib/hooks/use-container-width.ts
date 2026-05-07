import { type RefObject, useEffect, useState } from 'react'

export function useContainerWidth(ref: RefObject<HTMLElement | null>, debounceMs = 80): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function scheduleWidth(nextWidth: number): void {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        setWidth(nextWidth)
        timeoutId = null
      }, debounceMs)
    }

    const ro = new ResizeObserver(function handleResize([entry]) {
      scheduleWidth(entry.contentRect.width)
    })

    ro.observe(el)
    setWidth(el.clientWidth)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      ro.disconnect()
    }
  }, [ref, debounceMs])

  return width
}
