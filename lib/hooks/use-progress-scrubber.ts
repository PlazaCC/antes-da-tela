import { useCallback, useRef } from 'react'

export function useProgressScrubber(onSeek: (ratio: number) => void) {
  const barRef = useRef<HTMLDivElement>(null)

  const getRatio = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      const el = e.currentTarget
      onSeek(getRatio(e.clientX, el))
      const onMove = (ev: MouseEvent) => onSeek(getRatio(ev.clientX, el))
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [onSeek],
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      if (!touch || !barRef.current) return
      onSeek(getRatio(touch.clientX, barRef.current))
    },
    [onSeek],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      if (!touch || !barRef.current) return
      onSeek(getRatio(touch.clientX, barRef.current))
    },
    [onSeek],
  )

  return { barRef, onMouseDown, onTouchStart, onTouchMove }
}
