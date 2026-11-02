import { MediaPlayer } from '@/components/interpreter/media-player'
import type { CastMember } from '@/lib/types/calls'
import { cn } from '@/lib/utils'
import Link from 'next/link'

/** The chosen cast of an entry (vote and winner pages). */
export function CastList({ cast, className }: { cast: CastMember[]; className?: string }) {
  if (cast.length === 0) return null
  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      {cast.map((member) => (
        <div key={member.characterId} className='rounded-sm border border-border-subtle p-3 flex flex-col gap-2'>
          <p className='text-sm text-text-primary'>
            <span className='font-semibold'>{member.characterName}</span>
            {' — '}
            <Link href={`/profile/${member.interpreterId}`} className='hover:underline'>
              {member.interpreterName}
            </Link>
          </p>
          <MediaPlayer src={member.mediaUrl} kind={member.mediaType} />
        </div>
      ))}
    </div>
  )
}
