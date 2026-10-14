import { AppSidebar } from '@/components/app-sidebar/app-sidebar'
import { getAppUser } from '@/lib/auth/app-user'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAppUser()

  return (
    // One scroll (the page's): the sidebar sticks under the 64px NavBar instead
    // of the content getting its own scroll area above the footer.
    <div className="flex flex-1 flex-col bg-bg-base pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:min-h-[calc(100dvh-4rem)] md:flex-row md:pb-0">
      {!!user && <AppSidebar />}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
