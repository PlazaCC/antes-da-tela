import { SUPPORTERS } from '@/content/embaixadores'
import Image from 'next/image'

/** "Com o apoio de" strip with the supporters' logos, shown at the end of the ambassadors section. */
export function LandingSupporters() {
  return (
    <div className="land-reveal mt-16 border-t border-[var(--land-border)] pt-10 md:mt-20 md:pt-12" data-delay="2">
      <p className="m-0 mb-8 text-center font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--land-fg-3)]">
        Com o apoio de
      </p>
      <ul className="m-0 grid list-none grid-cols-2 items-center gap-x-6 gap-y-10 p-0 md:flex md:flex-wrap md:justify-center md:gap-x-16">
        {SUPPORTERS.map((supporter) => (
          <li key={supporter.name} className="flex justify-center">
            <a
              href={supporter.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={supporter.fullName}
              className="flex h-12 items-center opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              {supporter.logo ? (
                <Image
                  src={supporter.logo.src}
                  alt={supporter.name}
                  width={supporter.logo.width}
                  height={supporter.logo.height}
                  className="h-auto max-h-12 w-auto max-w-[140px] brightness-0 invert"
                />
              ) : (
                <span className="font-display text-[24px] text-[var(--land-fg)]">{supporter.name}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
