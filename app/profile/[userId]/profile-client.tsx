'use client'

import { ScriptCard } from '@/components/ui/script-card'
import type { ScriptListItem } from '@/server/api/scripts'
import type { User } from '@/server/db/schema'
import Image from 'next/image'

interface Props {
  user: User | null
  scripts: ScriptListItem[]
}

export function ProfileClient({ user, scripts }: Props) {
  if (!user) {
    return (
      <main className='max-w-[960px] mx-auto px-5 py-12'>
        <p className='text-muted text-body-small'>Profile not found.</p>
      </main>
    )
  }

  return (
    <main className='max-w-[960px] mx-auto px-5 py-12 flex flex-col gap-10'>
      {/* Profile header — ref: Avatar (38:115) */}
      <section className='flex items-start gap-5'>
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={80}
            height={80}
            unoptimized
            className='w-20 h-20 rounded-full object-cover border border-subtle shrink-0'
          />
        ) : (
          <div className='w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center text-2xl font-display text-brand-accent shrink-0'>
            {user.name[0]}
          </div>
        )}
        <div className='flex flex-col gap-1 pt-1'>
          <h1 className='font-display text-heading-2 text-primary'>{user.name}</h1>
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
                rating={null}
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
