import type { ReactNode } from 'react'

interface SectionHeadingProps {
  children: ReactNode
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return <p className='font-mono text-xs font-medium tracking-[0.08em] text-brand-accent uppercase mb-4'>{children}</p>
}
