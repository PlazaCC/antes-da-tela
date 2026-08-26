import { AppToaster } from '@/components/app-toaster/app-toaster'
import { Footer } from '@/components/footer/footer'
import { NavBar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { TRPCReactProvider } from '@/trpc/client'
import type { Metadata } from 'next'
import { DM_Mono, Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import './globals.css'

const defaultUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'Antes da Tela - Propriedades Intelectuais Audiovisuais',
    template: '%s | Antes da Tela',
  },
  description:
    'Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.',
  icons: {
    // New favicon is served automatically from app/favicon.ico (Next.js App Router)
    apple: '/favicon/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome',
        url: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
      },
      {
        rel: 'android-chrome',
        url: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
      },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    title: 'Antes da Tela - Propriedades Intelectuais Audiovisuais',
    description:
      'Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.',
    type: 'website',
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Antes da Tela - Propriedades Intelectuais Audiovisuais',
    images: ['/opengraph-image.png'],
    description:
      'Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.',
  },
}

const inter = Inter({
  variable: '--font-sans',
  display: 'swap',
  subsets: ['latin'],
  weight: ['400', '600'],
})

const clashGrotesk = localFont({
  src: [
    {
      path: '../fonts/ClashGrotesk-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/ClashGrotesk-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/ClashGrotesk-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/ClashGrotesk-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-display',
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-mono',
  display: 'swap',
  subsets: ['latin'],
  weight: ['400'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${clashGrotesk.variable} ${dmMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <TRPCReactProvider>
            <ThemeProvider>
              <NavBar />
              {children}
              <Footer />
              <AppToaster />
            </ThemeProvider>
          </TRPCReactProvider>
        </Suspense>
      </body>
    </html>
  )
}
