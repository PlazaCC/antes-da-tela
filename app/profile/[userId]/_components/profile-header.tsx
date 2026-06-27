'use client'

import { Avatar } from '@/components/avatar'
import { FollowButton } from '@/components/follow-button'
import { FollowListDialog, type FollowListVariant } from '@/components/profile/follow-list-dialog'
import Link from 'next/link'
import { useState } from 'react'
import type { UserProfile, ProfileStats } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function StatItem({
  value,
  label,
  accent,
  onClick,
}: {
  value: string
  label: string
  accent?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <span
        className={cn('font-display text-[18px] leading-[1.37]', accent ? 'text-brand-accent' : 'text-text-primary')}>
        {value}
      </span>
      <span className='font-mono text-label-mono-small text-text-muted uppercase tracking-[0.04em]'>{label}</span>
    </>
  )

  if (onClick) {
    return (
      <button
        type='button'
        onClick={onClick}
        className='flex flex-col gap-0.5 text-left transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-sm'>
        {content}
      </button>
    )
  }

  return <div className='flex flex-col gap-0.5'>{content}</div>
}

interface ProfileHeaderProps {
  user: UserProfile
  stats: ProfileStats
  isOwnProfile: boolean
}

export function ProfileHeader({ user, stats, isOwnProfile }: ProfileHeaderProps) {
  const userName = user.name?.trim() || 'Usuário'
  const handle = `@${userName.toLowerCase().replace(/\s+/g, '')} · Roteirista`
  const [followList, setFollowList] = useState<FollowListVariant | null>(null)

  return (
    <>
      {/* Banner */}
      <div className='w-full h-[180px] bg-gradient-to-t from-black to-[#2a1a0f] relative overflow-hidden' />

      {/* Profile hero */}
      <div className='bg-surface border-b border-border-default'>
        <div className='max-w-[1280px] mx-auto px-5 md:px-10 relative pb-6 md:pb-8'>
          {/* Avatar overlapping banner */}
          <div className='absolute -top-12 left-5 md:left-10 translate-x-0'>
            <Avatar
              src={user.image}
              name={userName}
              size='xl'
              className='border-[4px] border-bg-base w-24 h-24 md:w-28 md:h-28 shadow-xl'
            />
          </div>

          {/* Profile info — offset past avatar */}
          <div className='flex flex-col pt-16 md:pt-3 md:ml-[140px]'>
            <div className='flex flex-col md:flex-row md:items-start justify-between gap-4 w-full'>
              <div className='flex flex-col gap-1'>
                <h1 className='font-display text-[26px] md:text-[28px] leading-tight text-text-primary break-words max-w-full'>
                  {user.name}
                </h1>
                <p className='font-mono text-[11px] md:text-[12px] leading-tight text-text-muted'>
                  {handle}
                </p>
                {user.bio && (
                  <p className='text-body-small text-text-secondary mt-2.5 max-w-[500px] leading-relaxed'>
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className='flex items-center gap-2 pt-1 shrink-0'>
                {isOwnProfile ? (
                  <>
                    <Button asChild className='flex-1 md:flex-none bg-brand-accent text-text-primary hover:bg-brand-accent/90 h-9 px-4 text-xs md:text-sm font-semibold'>
                      <Link href='/profile/dashboard'>Dashboard</Link>
                    </Button>
                    <Button asChild variant='outline' className='flex-1 md:flex-none h-9 px-4 text-xs md:text-sm'>
                      <Link href='/profile/edit'>Editar Perfil</Link>
                    </Button>
                  </>
                ) : (
                  <FollowButton authorId={user.id} />
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className='flex flex-wrap items-start gap-x-8 gap-y-4 md:gap-14 mt-7 md:mt-5 border-t border-border-subtle/50 pt-5 md:border-t-0 md:pt-0'>
              <StatItem value={String(stats.scripts)} label='Roteiros' />
              <StatItem
                value={String(stats.followers)}
                label='Seguidores'
                onClick={() => setFollowList('followers')}
              />
              <StatItem
                value={String(stats.following)}
                label='Seguindo'
                onClick={() => setFollowList('following')}
              />
              {stats.avgRating !== null && (
                <StatItem value={`★ ${stats.avgRating.toFixed(1)}`} label='Avaliação média' accent />
              )}
            </div>
          </div>
        </div>
      </div>

      {followList && (
        <FollowListDialog
          userId={user.id}
          variant={followList}
          open={followList !== null}
          onOpenChange={(open) => !open && setFollowList(null)}
        />
      )}
    </>
  )
}
