'use client'

import { cn } from '@/lib/utils'
import type { ScriptListItem, ProfileStats, UserProfile } from '@/lib/types'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import { ProfileHeader } from './_components/profile-header'
import { ScriptsTab } from './_components/scripts-tab'

interface Props {
  user: UserProfile | null
  scripts: ScriptListItem[]
  stats: ProfileStats
}

export function ProfileClient({ user, scripts, stats }: Props) {
  const trpc = useTRPC()
  const { userId: currentUserId } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'scripts' | 'ratings' | 'activity'>('scripts')

  const isOwnProfile = currentUserId === user?.id

  const scriptIds = scripts.map((s) => s.id)
  const { data: ratingsMap } = useQuery({
    ...trpc.ratings.getManyAverage.queryOptions({ scriptIds }),
    enabled: scriptIds.length > 0,
  })

  if (!user) {
    return (
      <main className='max-w-[1280px] mx-auto px-10 py-12'>
        <p className='text-text-muted text-body-small font-mono'>Perfil não encontrado.</p>
      </main>
    )
  }

  return (
    <div className='min-h-screen bg-bg-base'>
      <ProfileHeader user={user} stats={stats} isOwnProfile={isOwnProfile} />
      
      {/* Tabs Navigation */}
      <div className='bg-surface border-b border-border-default'>
        <div className='max-w-[1280px] mx-auto px-5 sm:px-10 overflow-x-auto'>
          <nav className='flex gap-6 sm:gap-8 min-w-max'>
            {(
              [
                { id: 'scripts', label: `Roteiros (${stats.scripts})` },
                { id: 'ratings', label: 'Avaliações' },
                { id: 'activity', label: 'Atividade' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-3 font-sans text-[13px] font-semibold border-b-2 -mb-px transition-colors',
                  activeTab === tab.id
                    ? 'border-brand-accent text-text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary',
                )}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content area */}
      <div className='max-w-[1280px] mx-auto px-5 sm:px-10 py-6'>
        {activeTab === 'scripts' && (
          <ScriptsTab 
            scripts={scripts} 
            authorName={user.name ?? ''} 
            ratingsMap={ratingsMap} 
          />
        )}

        {activeTab === 'ratings' && (
          <p className='text-text-muted font-mono text-label-mono-caps py-12'>Avaliações em breve.</p>
        )}

        {activeTab === 'activity' && (
          <p className='text-text-muted font-mono text-label-mono-caps py-12'>Atividade em breve.</p>
        )}
      </div>
    </div>
  )
}
