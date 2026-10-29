import { cn } from '@/lib/utils'

interface MediaPlayerProps {
  src: string | null
  kind: 'video' | 'audio'
  className?: string
}

/** Native player for an interpreter presentation (video or audio). */
export function MediaPlayer({ src, kind, className }: MediaPlayerProps) {
  if (!src) {
    return <p className={cn('text-body-small text-text-muted', className)}>Mídia indisponível no momento.</p>
  }
  return kind === 'video' ? (
    <video src={src} controls preload='metadata' className={cn('w-full rounded-sm bg-black aspect-video', className)} />
  ) : (
    <audio src={src} controls preload='metadata' className={cn('w-full', className)} />
  )
}
