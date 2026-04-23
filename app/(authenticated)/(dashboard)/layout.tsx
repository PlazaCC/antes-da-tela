import { AppSidebar } from '@/components/app-sidebar/app-sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className='min-h-screen bg-bg-base flex flex-col md:flex-row pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0'>
      {!!user && <AppSidebar />}
      <main className='flex-1 min-w-0'>
        {children}
      </main>
    </div>
  )
}
