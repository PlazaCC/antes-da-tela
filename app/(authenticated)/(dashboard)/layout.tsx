import { AppSidebar } from '@/components/app-sidebar/app-sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-bg-base pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:h-[calc(100vh-56px)] md:flex-row md:pb-0">
      {!!user && <AppSidebar />}
      <main className="h-full flex-1 overflow-auto">{children}</main>
    </div>
  )
}
