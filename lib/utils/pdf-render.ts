export function getTopOverlayHeight(): number {
  if (typeof document === 'undefined') return 0

  const pageToolbar = document.getElementById('pdf-toolbar')
  const appHeader = document.querySelector('header')

  const toolbarHeight = pageToolbar?.getBoundingClientRect().bottom ?? 0
  const headerHeight = appHeader?.getBoundingClientRect().bottom ?? 0

  return Math.max(toolbarHeight, headerHeight)
}

export function calculatePanBounds(
  containerWidth: number,
  contentWidth: number,
  containerHeight: number,
  contentHeight: number,
) {
  const maxX = 0
  const minX = Math.min(containerWidth - contentWidth, 0)
  const maxY = 0
  const minY = Math.min(containerHeight - contentHeight, 0)
  return { maxX, minX, maxY, minY }
}

export function calculateCenteredPan(
  containerWidth: number,
  contentWidth: number,
): number {
  if (contentWidth >= containerWidth) return 0
  return (containerWidth - contentWidth) / 2
}

export function calculateFitScale(
  containerWidth: number,
  naturalWidth: number,
  userZoom: number,
): number {
  if (naturalWidth <= 0) return 0
  return (containerWidth / naturalWidth) * userZoom
}

export function clampPan(
  x: number,
  y: number,
  containerWidth: number,
  contentWidth: number,
  containerHeight: number,
  contentHeight: number,
) {
  const { maxX, minX, maxY, minY } = calculatePanBounds(
    containerWidth,
    contentWidth,
    containerHeight,
    contentHeight,
  )
  return {
    x: Math.max(Math.min(x, maxX), minX),
    y: Math.max(Math.min(y, maxY), minY),
  }
}
