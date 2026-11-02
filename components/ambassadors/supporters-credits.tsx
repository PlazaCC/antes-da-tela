import type { Supporter } from '@/content/embaixadores'
import Image from 'next/image'

interface SupportersCreditsProps {
  supporters: Supporter[]
}

export function SupportersCredits({ supporters }: SupportersCreditsProps) {
  return (
    <ul className='mx-auto grid max-w-[720px] gap-10 md:grid-cols-2 md:gap-16'>
      {supporters.map((supporter) => (
        <li key={supporter.name}>
          <a
            href={supporter.href}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex flex-col items-center gap-4 rounded-md p-4 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring'
          >
            <span className='flex h-[72px] items-center justify-center'>
              {supporter.logo ? (
                <Image
                  src={supporter.logo.src}
                  alt={supporter.name}
                  width={supporter.logo.width}
                  height={supporter.logo.height}
                  className='opacity-90 brightness-0 invert transition-opacity group-hover:opacity-100'
                />
              ) : (
                <span className='[font-family:var(--font-display)] text-[40px] font-semibold leading-none tracking-[-0.02em] text-text-primary'>
                  {supporter.name}
                </span>
              )}
            </span>
            <span className='text-body-small text-text-secondary group-hover:text-text-primary'>{supporter.fullName}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
