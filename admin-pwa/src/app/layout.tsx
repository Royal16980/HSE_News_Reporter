import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'HSE News Admin',
  description: 'Mobile-first PWA for reviewing and scheduling HSE News content',
  manifest: '/manifest.json',
  themeColor: '#0066FF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HSE Admin',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-oled-black text-gray-900 dark:text-white antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-oled-black dark:to-black">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
