'use client'

import { Avatar } from '@/components/avatar'
import { FollowButton } from '@/components/follow-button'
import { ScriptCard } from '@/components/script-card/script-card'
import { cn } from '@/lib/utils'
import type { ScriptListItem, ProfileStats, UserProfile } from '@/lib/types'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useCurrentUser } from '@/lib/hooks/use-current-user'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar/app-sidebar'

interface Props {
  user: UserProfile | null
  scripts: ScriptListItem[]
  stats: ProfileStats
}

function StatItem({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span
        className={cn('font-display text-[18px] leading-[1.37]', accent ? 'text-brand-accent' : 'text-text-primary')}>
        {value}
      </span>
      <span className='font-mono text-label-mono-small text-text-muted uppercase tracking-[0.04em]'>{label}</span>
    </div>
  )
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
        <p className='text-text-muted text-body-small font-mono'>Profile not found.</p>
      </main>
    )
  }

  const userName = user.name?.trim() || 'Usuário'
  const handle = `@${userName.toLowerCase().replace(/\s+/g, '')} · Roteirista`

  return (
    <div className='min-h-screen bg-bg-base flex flex-col md:flex-row pb-[60px] md:pb-0'>
      {!!currentUserId && <AppSidebar />}
      <div className='flex-1'>
        {/* Banner */}
      <div className='w-full h-[180px] bg-gradient-to-t from-black to-[#2a1a0f] relative overflow-hidden' />

      {/* Profile hero */}
      <div className='bg-surface border-b border-border-default'>
        <div className='max-w-[1280px] mx-auto px-5 sm:px-10 relative pb-6 md:pb-8'>
          {/* Avatar overlapping banner */}
          <div className='absolute -top-12 left-1/2 -translate-x-1/2 sm:left-10 sm:translate-x-0'>
            <Avatar
              src={user.image}
              name={userName}
              size='xl'
              className='border-[4px] border-bg-base w-24 h-24 sm:w-28 sm:h-28 shadow-xl'
            />
          </div>

          {/* Profile info — offset past avatar */}
          <div className='flex flex-col items-center sm:items-start pt-16 sm:pt-3 sm:ml-[140px]'>
            <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-6 w-full'>
              <div className='flex flex-col gap-1 items-center sm:items-start'>
                <h1 className='font-display text-[24px] sm:text-[28px] leading-[1.3] text-text-primary'>{user.name}</h1>
                <p className='font-mono text-[12px] leading-[1.3] text-text-muted'>{handle}</p>
                {user.bio && <p className='text-body-small text-text-secondary mt-2 max-w-[500px] text-center sm:text-left'>{user.bio}</p>}
              </div>

              {/* Action buttons */}
              <div className='flex items-center justify-center sm:justify-start gap-3 pt-1 shrink-0'>
                {isOwnProfile ? (
                  <>
                    <Link href='/profile/dashboard' className='px-4 flex items-center h-9 rounded-sm bg-brand-accent text-text-primary font-sans text-[12px] font-semibold hover:bg-brand-accent/90 transition-colors'>
                      Dashboard
                    </Link>
                    <Link href='/profile/edit' className='px-4 flex items-center h-9 rounded-sm border border-border-subtle text-text-secondary font-sans text-[12px] font-normal hover:border-border-default transition-colors'>
                      Editar Perfil
                    </Link>
                  </>
                ) : (
                  <>
                    <FollowButton authorId={user.id} />
                    <button className='px-4 h-9 rounded-sm border border-border-subtle text-text-secondary font-sans text-[12px] font-normal hover:border-border-default transition-colors'>
                      Mensagem
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className='flex flex-wrap items-start justify-center sm:justify-start gap-x-8 gap-y-4 sm:gap-14 mt-6 sm:mt-5'>
              <StatItem value={String(stats.scripts)} label='Roteiros' />
              <StatItem value={String(stats.followers)} label='Seguidores' />
              <StatItem value={String(stats.following)} label='Seguindo' />
              {stats.avgRating !== null && <StatItem value={`★ ${stats.avgRating.toFixed(1)}`} label='Avaliação média' accent />}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          <>
            {/* Sort bar */}
            <div className='flex items-center justify-between mb-5'>
              <p className='font-mono text-[12px] text-text-muted'>{stats.scripts} roteiros publicados</p>
              <button className='flex items-center gap-1 px-3 h-7 rounded-sm border border-border-default text-text-secondary font-sans text-[11px] hover:border-border-subtle transition-colors'>
                Mais recentes ▾
              </button>
            </div>

            {scripts.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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
              <p className='text-text-muted font-mono text-label-mono-caps'>No scripts published yet.</p>
            )}
          </>
        )}

        {activeTab === 'ratings' && (
          <p className='text-text-muted font-mono text-label-mono-caps'>Ratings coming soon.</p>
        )}

        {activeTab === 'activity' && (
          <p className='text-text-muted font-mono text-label-mono-caps'>Activity coming soon.</p>
        )}
      </div>
    </div>
  </div>
  )
}
