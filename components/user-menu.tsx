'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  userId: string
  userName: string | null
  userImage: string | null
}

export function UserMenu({ userId, userName, userImage }: UserMenuProps) {
  const router = useRouter()
  const initial = userName?.[0]?.toUpperCase() ?? '?'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className='w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-xs font-medium text-brand-accent shrink-0 hover:bg-brand-accent/30 transition-colors overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent'
          aria-label='User menu'
        >
          {userImage ? (
            <Image src={userImage} alt={userName ?? 'Avatar'} width={32} height={32} unoptimized className='w-8 h-8 object-cover' />
          ) : (
            initial
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-44'>
        <DropdownMenuItem asChild>
          <Link href={`/profile/${userId}`} className='cursor-pointer'>
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/account' className='cursor-pointer'>
            Minha conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer text-text-muted focus:text-text-secondary'
          onSelect={handleLogout}
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
