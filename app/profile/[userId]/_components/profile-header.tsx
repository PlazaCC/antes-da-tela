'use client'

import { Avatar } from '@/components/avatar'
import { FollowButton } from '@/components/follow-button'
import Link from 'next/link'
import type { UserProfile, ProfileStats } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

interface ProfileHeaderProps {
  user: UserProfile
  stats: ProfileStats
  isOwnProfile: boolean
}

export function ProfileHeader({ user, stats, isOwnProfile }: ProfileHeaderProps) {
  const userName = user.name?.trim() || 'Usuário'
  const handle = `@${userName.toLowerCase().replace(/\s+/g, '')} · Roteirista`

  return (
    <>
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
                {user.bio && (
                  <p className='text-body-small text-text-secondary mt-2 max-w-[500px] text-center sm:text-left'>
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className='flex items-center justify-center sm:justify-start gap-3 pt-1 shrink-0'>
                {isOwnProfile ? (
                  <>
                    <Button asChild className='bg-brand-accent text-text-primary hover:bg-brand-accent/90 h-9 px-4'>
                      <Link href='/profile/dashboard'>Dashboard</Link>
                    </Button>
                    <Button asChild variant='outline' className='h-9 px-4'>
                      <Link href='/profile/edit'>Editar Perfil</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <FollowButton authorId={user.id} />
                    <Button variant='outline' className='h-9 px-4'>Mensagem</Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className='flex flex-wrap items-start justify-center sm:justify-start gap-x-8 gap-y-4 sm:gap-14 mt-6 sm:mt-5'>
              <StatItem value={String(stats.scripts)} label='Roteiros' />
              <StatItem value={String(stats.followers)} label='Seguidores' />
              <StatItem value={String(stats.following)} label='Seguindo' />
              {stats.avgRating !== null && (
                <StatItem value={`★ ${stats.avgRating.toFixed(1)}`} label='Avaliação média' accent />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
