import { cn } from '@/lib/utils'
import { Film } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface SidebarProps {
  script: {
    id: string
    title: string
    genre: string | null
    script_files: Array<{ page_count: number | null }>
    published_at: string | null
    cover_path?: string | null
  }
  publishedAtFormatted: string | null
  coverUrl?: string
  onClose: () => void
}

export function ModalSidebar({ script, publishedAtFormatted, coverUrl, onClose }: SidebarProps) {
  return (
    <aside className='hidden md:flex flex-col w-64 shrink-0 border-r border-border-subtle p-6 gap-6'>
      {/* Cover Image or Placeholder */}
      <div className='w-full aspect-[2/3] rounded-sm bg-elevated border border-border-subtle flex flex-col items-center justify-center gap-2 overflow-hidden relative'>
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={script.title}
            fill
            className='object-cover'
          />
        ) : (
          <>
            <Film className='w-8 h-8 text-text-muted' />
            <span className='font-mono text-[10px] text-text-muted uppercase tracking-wider'>Sem Capa</span>
          </>
        )}
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
