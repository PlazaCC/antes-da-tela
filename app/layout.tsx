import { AppToaster } from '@/components/app-toaster/app-toaster'
import { NavBar } from '@/components/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import { TRPCReactProvider } from '@/trpc/client'
import type { Metadata } from 'next'
import { DM_Mono, DM_Serif_Display, Inter } from 'next/font/google'
import './globals.css'

const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.antesdatela.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: 'Antes da Tela - Propriedades Intelectuais Audiovisuais',
    template: '%s | Antes da Tela',
  },
  description:
    'Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
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

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-display',
  display: 'swap',
  subsets: ['latin'],
  weight: ['400'],
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
        className={`${inter.variable} ${dmSerifDisplay.variable} ${dmMono.variable} antialiased`}
      >
        <TRPCReactProvider>
          <ThemeProvider>
            <NavBar />
            {children}
            <AppToaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
