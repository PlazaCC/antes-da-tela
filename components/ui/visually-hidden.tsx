import * as React from 'react'

/**
 * VisuallyHidden component for accessibility (screen readers only).
 * Usage: <VisuallyHidden>content</VisuallyHidden>
 */
export function VisuallyHidden({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      style={{
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: '1px',
        margin: '-1px',
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        width: '1px',
        whiteSpace: 'nowrap',
      }}
      {...props}>
      {children}
    </span>
  )
}
