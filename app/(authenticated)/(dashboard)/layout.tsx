'use client'

import { AppSidebar } from '@/components/app-sidebar/app-sidebar'
import { useCurrentUser } from '@/lib/hooks/use-current-user'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = useCurrentUser()

  return (
    <div className='min-h-screen bg-bg-base flex flex-col md:flex-row pb-[60px] md:pb-0'>
      {!!userId && <AppSidebar />}
      <main className='flex-1 min-w-0'>
        {children}
      </main>
    </div>
  )
}
