'use client'

import { Avatar } from '@/components/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

export type FollowListVariant = 'followers' | 'following'

interface FollowListDialogProps {
  userId: string
  variant: FollowListVariant
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FollowListDialog({ userId, variant, open, onOpenChange }: FollowListDialogProps) {
  const trpc = useTRPC()
  const queryOptions =
    variant === 'followers'
      ? trpc.users.listFollowers.queryOptions({ userId })
      : trpc.users.listFollowing.queryOptions({ userId })

  const { data, isLoading } = useQuery({ ...queryOptions, enabled: open })

  const title = variant === 'followers' ? 'Seguidores' : 'Seguindo'
  const emptyLabel = variant === 'followers' ? 'Nenhum seguidor ainda.' : 'Não está seguindo ninguém.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col max-h-[60vh] overflow-y-auto -mx-2'>
          {isLoading ? (
            <p className='px-2 py-6 text-text-muted text-body-small font-mono'>Carregando…</p>
          ) : data && data.length > 0 ? (
            data.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                onClick={() => onOpenChange(false)}
                className='flex items-center gap-3 px-2 py-2.5 rounded-sm hover:bg-elevated transition-colors'>
                <Avatar src={user.image} name={user.name ?? '?'} size='lg' />
                <div className='flex flex-col min-w-0'>
                  <span className='text-body-small font-medium text-text-primary truncate'>{user.name}</span>
                  {user.bio ? <span className='text-[12px] text-text-muted truncate'>{user.bio}</span> : null}
                </div>
              </Link>
            ))
          ) : (
            <p className='px-2 py-6 text-text-muted text-body-small'>{emptyLabel}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
