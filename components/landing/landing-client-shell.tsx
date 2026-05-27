'use client'

import { useEffect } from 'react'

export function LandingClientShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const els = document.querySelectorAll('.land-reveal')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  })

  return <div className='land-root'>{children}</div>
}
