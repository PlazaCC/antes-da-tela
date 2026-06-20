import { redirect } from 'next/navigation'

// The landing page is now the site root. Keep this path working for old links.
export default function LandingRedirect() {
  redirect('/')
}
