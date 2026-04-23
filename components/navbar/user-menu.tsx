'use client'

import { Avatar } from '@/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { USER_MENU_ITEMS } from '@/lib/constants/navigation'
import { useLogout } from '@/lib/hooks/use-logout'
import { cn } from '@/lib/utils'
import { LogOutIcon } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  userId: string
  userName: string | null
  userImage: string | null
}

export function UserMenu({ userId, userName, userImage }: UserMenuProps) {
  const handleLogout = useLogout()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className='rounded-full hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'
          aria-label='Menu do usuário'>
          <Avatar src={userImage} name={userName ?? '?'} size='sm' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-56 p-1 bg-surface border border-border-default shadow-xl rounded-md'>
        <div className='px-2 py-1.5 mb-1'>
          <p className='text-xs font-medium text-text-primary truncate'>{userName}</p>
        </div>
        <DropdownMenuSeparator className='bg-border-default mx-1' />
        {USER_MENU_ITEMS(userId).map((item) => {
          const Icon = item.icon
          const isHighlighted = 'highlighted' in item && item.highlighted

          return (
            <DropdownMenuItem key={item.id} asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-2 cursor-pointer text-sm rounded-sm transition-colors outline-none',
                  isHighlighted
                    ? 'text-brand-accent bg-brand-accent/5 hover:bg-brand-accent/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-elevated',
                )}>
                <Icon className={cn('w-4 h-4', isHighlighted ? 'text-brand-accent' : 'text-text-muted')} />
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator className='bg-border-default mx-1' />
        <DropdownMenuItem
          className='flex items-center gap-2.5 px-2 py-2 cursor-pointer text-sm text-state-error hover:bg-state-error/10 rounded-sm transition-colors focus:bg-state-error/10 outline-none'
          onSelect={handleLogout}>
          <LogOutIcon className='w-4 h-4' />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
