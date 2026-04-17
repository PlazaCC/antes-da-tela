import AppToaster from '@/components/app-toaster/app-toaster'
import { NavBar } from '@/components/navbar'
import { PostHogProvider } from '@/components/posthog-provider'
import { TRPCReactProvider } from '@/trpc/client'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { DM_Mono, DM_Serif_Display, Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Antes da Tela',
  description: 'Plataforma de publicação, leitura e discussão de roteiros audiovisuais.',
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
    <html lang='en' suppressHydrationWarning className='dark'>
      <body className={`${inter.variable} ${dmSerifDisplay.variable} ${dmMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <PostHogProvider>
            <TRPCReactProvider>
              <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
                <NavBar />
                {children}
                <AppToaster />
              </ThemeProvider>
            </TRPCReactProvider>
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}
