'use client'

import { SearchSheet } from '@/components/search-sheet'
import { Button } from '@/components/ui/button'
import { SearchIcon } from 'lucide-react'
import { useState } from 'react'

export function NavBarMobileControls() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setSearchOpen(true)}
        aria-label='Buscar roteiros'
        size='icon'
        variant={'ghost'}
        className='flex md:hidden items-center justify-center text-muted-foreground'>
        <SearchIcon />
      </Button>
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
