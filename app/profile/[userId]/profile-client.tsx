'use client'

import { Avatar } from '@/components/avatar'
import { FollowButton } from '@/components/follow-button'
import { ScriptCard } from '@/components/ui/script-card'
import { cn } from '@/lib/utils'
import type { ScriptListItem } from '@/server/api/scripts'
import type { User } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

interface ProfileStats {
  followers: number
  following: number
  scripts: number
  avgRating: number | null
}

interface Props {
  user: User | null
  scripts: ScriptListItem[]
  currentUserId: string | null
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

export function ProfileClient({ user, scripts, currentUserId, stats }: Props) {
  const trpc = useTRPC()
  const [activeTab, setActiveTab] = useState<'scripts' | 'ratings' | 'activity'>('scripts')

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

  const isOwnProfile = currentUserId === user.id
  const userName = user.name?.trim() || 'Usuário'
  const handle = `@${userName.toLowerCase().replace(/\s+/g, '')} · Roteirista`

  return (
    <div className='min-h-screen bg-bg-base'>
      {/* Banner */}
      <div className='w-full h-[100px] bg-elevated' />

      {/* Profile hero */}
      <div className='bg-surface border-b border-border-default'>
        <div className='max-w-[1280px] mx-auto px-10 relative pb-6'>
          {/* Avatar overlapping banner */}
          <div className='absolute -top-10 left-10'>
            <Avatar
              src={user.image}
              name={userName}
              size='xl'
              className='border-[3px] border-border-subtle w-20 h-20'
            />
          </div>

          {/* Profile info — offset past avatar */}
          <div className='ml-[120px] pt-3'>
            <div className='flex items-start justify-between gap-6'>
              <div className='flex flex-col gap-1'>
                <h1 className='font-display text-[22px] leading-[1.37] text-text-primary'>{user.name}</h1>
                <p className='font-mono text-[12px] leading-[1.3] text-text-muted'>{handle}</p>
                {user.bio && <p className='text-body-small text-text-secondary mt-1 max-w-[500px]'>{user.bio}</p>}
              </div>

              {/* Action buttons */}
              <div className='flex items-center gap-3 pt-1 shrink-0'>
                {!isOwnProfile && <FollowButton authorId={user.id} />}
                <button className='px-4 h-9 rounded-sm border border-border-subtle text-text-secondary font-sans text-[12px] font-normal hover:border-border-default transition-colors'>
                  Mensagem
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className='flex items-start gap-14 mt-5'>
              <StatItem value={String(stats.scripts)} label='Roteiros' />
              <StatItem value={String(stats.followers)} label='Seguidores' />
              <StatItem value={String(stats.following)} label='Seguindo' />
              {stats.avgRating !== null && <StatItem value={`★ ${stats.avgRating}`} label='Avaliação média' accent />}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-surface border-b border-border-default'>
        <div className='max-w-[1280px] mx-auto px-10'>
          <nav className='flex gap-8'>
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
      <div className='max-w-[1280px] mx-auto px-10 py-6'>
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
  )
}
