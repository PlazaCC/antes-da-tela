'use client'

import { Avatar } from '@/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/lib/hooks/use-logout'
import { FileUpIcon, LogOutIcon, SettingsIcon, UserCircle2 } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  userId: string
  userName: string | null
  userImage: string | null
}

export function UserMenu({ userId, userName, userImage }: UserMenuProps) {
  const handleLogout = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className='rounded-full hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base'
          aria-label='User menu'>
          <Avatar src={userImage} name={userName ?? '?'} size='sm' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuItem asChild>
          <Link href='/publish' className='cursor-pointer'>
            <FileUpIcon />
            Publicar Roteiro
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${userId}`} className='cursor-pointer'>
            <UserCircle2 />
            Ver perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/account' className='cursor-pointer'>
            <SettingsIcon />
            Editar conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer text-state-error focus:text-text-secondary' onSelect={handleLogout}>
          <LogOutIcon />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
