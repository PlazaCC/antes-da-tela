import { AdminNav } from '@/components/admin/admin-nav'
import { isCurrentUserAdmin } from '@/lib/auth/admin'
import { getAppUser } from '@/lib/auth/app-user'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Admin', robots: { index: false } }

/**
 * Staff back office (RFC-006). Non-admins get a 404 so the area is not
 * advertised; every admin procedure re-checks on the server anyway.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAppUser()
  if (!user) {
    const pathname = (await headers()).get('x-pathname') ?? '/admin/interpretes'
    redirect(`/auth/login?next=${encodeURIComponent(pathname)}`)
  }
  if (!(await isCurrentUserAdmin())) notFound()

  return (
    <div className='flex-1 bg-bg-base'>
      <AdminNav />
      {children}
    </div>
  )
}
