import { type RefObject, useEffect, useState } from 'react'

export function useContainerWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })

    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [ref])

  return width
}
