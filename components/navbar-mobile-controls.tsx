'use client'

import { SearchSheet } from '@/components/search-sheet'
import { Button } from '@/components/ui/button'
import { FileUpIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function NavBarMobileControls() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <Button
        asChild
        aria-label='Publicar roteiro'
        size='icon'
        variant={'ghost'}
        className='flex md:hidden items-center justify-center h-auto'>
        <Link href='/publish'>
          <FileUpIcon />
        </Link>
      </Button>
      <Button
        onClick={() => setSearchOpen(true)}
        aria-label='Buscar roteiros'
        size='icon'
        variant={'ghost'}
        className='flex md:hidden items-center justify-center'>
        <SearchIcon />
      </Button>
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
