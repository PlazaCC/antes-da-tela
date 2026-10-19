// Production must never fall back to VERCEL_URL: that is the per-deployment
// host (*.vercel.app), which sits behind Deployment Protection, so crawlers
// (WhatsApp, LinkedIn, X…) get a redirect instead of the OG image.
// antesdatela.com 308-redirects to www, so www is the final host.
const PRODUCTION_URL = 'https://www.antesdatela.com'

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_ENV === 'production') return PRODUCTION_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
