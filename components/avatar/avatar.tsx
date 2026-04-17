import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = { sm: 28, md: 32, lg: 48, xl: 80 } as const

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const px = sizes[size]
  const textSize = size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-sm' : 'text-[10px]'

  return (
    <div
      style={{ width: px, height: px }}
      className={cn(
        'rounded-full overflow-hidden shrink-0 border border-border-default',
        'bg-brand-accent/20 flex items-center justify-center',
        className,
      )}>
      {src ? (
        <Image src={src} alt={name} width={px} height={px} unoptimized className='w-full h-full object-cover' />
      ) : (
        <span className={cn('text-brand-accent font-medium leading-none select-none', textSize)}>
          {initials(name)}
        </span>
      )}
    </div>
  )
}
