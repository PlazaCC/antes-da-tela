'use client'

import { Avatar } from '@/components/avatar'
import { FollowButton } from '@/components/follow-button'
import { ScriptCard } from '@/components/ui/script-card'
import type { ScriptListItem } from '@/server/api/scripts'
import type { User } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

interface Props {
  user: User | null
  scripts: ScriptListItem[]
  currentUserId: string | null
}

export function ProfileClient({ user, scripts, currentUserId }: Props) {
  const trpc = useTRPC()
  const scriptIds = scripts.map((script) => script.id)
  const { data: ratingsMap } = useQuery({
    ...trpc.ratings.getManyAverage.queryOptions({ scriptIds }),
    enabled: scriptIds.length > 0,
  })
  if (!user) {
    return (
      <main className='max-w-[960px] mx-auto px-5 py-12'>
        <p className='text-muted text-body-small'>Profile not found.</p>
      </main>
    )
  }

  const isOwnProfile = currentUserId === user.id

  return (
    <main className='max-w-[960px] mx-auto px-5 py-12 flex flex-col gap-10'>
      {/* Profile header */}
      <section className='flex items-start gap-5'>
        <Avatar src={user.image} name={user.name} size='xl' />
        <div className='flex flex-col gap-2 pt-1'>
          <div className='flex items-center gap-3 flex-wrap'>
            <h1 className='font-display text-heading-2 text-primary'>{user.name}</h1>
            {!isOwnProfile && <FollowButton authorId={user.id} />}
          </div>
          {user.bio && <p className='text-secondary text-body-default max-w-lg'>{user.bio}</p>}
        </div>
      </section>

      {/* Scripts by this author */}
      <section>
        <h2 className='font-display text-heading-3 text-primary mb-4'>Published Scripts</h2>
        {scripts.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {scripts.map((script) => (
              <ScriptCard
                key={script.id}
                href={`/scripts/${script.id}`}
                title={script.title}
                author={user.name}
                genre={script.genre ?? ''}
                rating={ratingsMap?.[script.id]?.average ?? null}
                ratingTotal={ratingsMap?.[script.id]?.total ?? 0}
                pages={script.script_files?.[0]?.page_count ?? null}
              />
            ))}
          </div>
        ) : (
          <p className='text-muted text-body-small'>No scripts published yet.</p>
        )}
      </section>
    </main>
  )
}
