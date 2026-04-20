'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SidebarProps {
  script: {
    id: string
    genre: string | null
    script_files: Array<{ page_count: number | null }>
    published_at: string | null
  }
  publishedAtFormatted: string | null
  onClose: () => void
}

export function ModalSidebar({ script, publishedAtFormatted, onClose }: SidebarProps) {
  return (
    <aside className='hidden md:flex flex-col w-64 shrink-0 border-r border-border-subtle p-6 gap-6'>
      {/* Cover placeholder */}
      <div className='w-full aspect-[2/3] rounded-sm bg-elevated border border-border-subtle flex items-center justify-center'>
        <span className='font-mono text-label-mono-small text-text-muted'>Thumbnail 2:3</span>
      </div>

      {/* Metadata */}
      <dl className='flex flex-col gap-4'>
        {script.genre && (
          <div className='flex flex-col gap-0.5'>
            <dt className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider text-[10px]'>
              Gênero
            </dt>
            <dd className='text-body-small text-text-primary capitalize'>{script.genre}</dd>
          </div>
        )}
        {script.script_files?.[0]?.page_count && (
          <div className='flex flex-col gap-0.5'>
            <dt className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider text-[10px]'>
              Páginas
            </dt>
            <dd className='text-body-small text-text-primary'>{script.script_files[0].page_count} páginas</dd>
          </div>
        )}
        {publishedAtFormatted && (
          <div className='flex flex-col gap-0.5'>
            <dt className='font-mono text-label-mono-caps text-text-muted uppercase tracking-wider text-[10px]'>
              Publicado
            </dt>
            <dd className='text-body-small text-text-primary'>{publishedAtFormatted}</dd>
          </div>
        )}
      </dl>

      {/* CTA — anchored at bottom */}
      <div className='mt-auto'>
        <Link
          href={`/scripts/${script.id}`}
          className={cn(
            'flex items-center justify-center w-full py-2.5 rounded-sm',
            'bg-brand-accent text-white font-semibold text-body-small',
            'hover:bg-brand-accent/90 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
          )}
          onClick={onClose}>
          Ler Roteiro
        </Link>
      </div>
    </aside>
  )
}
