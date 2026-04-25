'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import React, { useEffect, useRef, useState } from 'react'

export interface SynopsisSpoilerProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string | null
  collapsedHeight?: number
  moreLabel?: string
  lessLabel?: string
}

export function SynopsisSpoiler({
  text,
  children,
  collapsedHeight = 144,
  moreLabel = 'Ver mais',
  lessLabel = 'Ver menos',
  className,
  ...props
}: React.PropsWithChildren<SynopsisSpoilerProps>) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const height = el.scrollHeight
    setContentHeight(height)
  }, [text, children, collapsedHeight])

  const maxHeight = isOpen ? (contentHeight ?? undefined) : collapsedHeight

  return (
    <div className={cn('relative', className)} {...props}>
      <div
        ref={contentRef}
        className='transition-[max-height] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden relative'
        style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined }}
        aria-expanded={isOpen}>
        <div className='text-body-default text-text-secondary leading-relaxed'>{text ?? children}</div>
        <div
          className={cn(
            'pointer-events-none absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-bg-base z-10 to-transparent transition-opacity duration-300 delay-75',
            {
              'opacity-100': !isOpen,
              'opacity-0': !!isOpen,
            },
          )}
        />
      </div>

      <div className='mt-3 z-20 relative'>
        <Button variant='link' size='sm' onClick={() => setIsOpen((v) => !v)} className='px-0'>
          {isOpen ? lessLabel : moreLabel}
        </Button>
      </div>
    </div>
  )
}

export default SynopsisSpoiler
