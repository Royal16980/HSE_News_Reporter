import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Newsreader } from 'next/font/google'
import { IBM_Plex_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://safetynews.pro'),
  title: {
    default: 'SafetyNews Pro — UK Health & Safety Intelligence',
    template: '%s | SafetyNews Pro',
  },
  description:
    'Autonomous UK Health & Safety news — prosecutions, enforcement, legislation, and analysis. Powered by NOVA-PRIME with Governance Swarm verification.',
  keywords: [
    'UK health and safety',
    'HSE prosecutions',
    'workplace safety',
    'HSWA 1974',
    'RIDDOR',
    'CDM 2015',
    'COSHH',
    'enforcement notice',
    'health and safety law',
    'HSE news',
    'NEBOSH',
    'IOSH',
  ],
  authors: [{ name: 'NOVA-PRIME Editorial Desk' }],
  creator: 'SafetyNews Pro',
  publisher: 'SafetyNews Pro',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://safetynews.pro',
    title: 'SafetyNews Pro — UK Health & Safety Intelligence',
    description:
      'Autonomous UK Health & Safety news — prosecutions, enforcement, legislation, and analysis.',
    siteName: 'SafetyNews Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SafetyNews Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafetyNews Pro — UK Health & Safety Intelligence',
    description: 'Autonomous UK Health & Safety news. Prosecutions, enforcement, legislation.',
    images: ['/og-image.jpg'],
    creator: '@safetynewspro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'SafetyNews Pro',
  description:
    'Autonomous UK Health & Safety newsroom operated by NOVA-PRIME with Governance Swarm verification.',
  url: 'https://safetynews.pro',
  logo: 'https://safetynews.pro/logo.png',
  sameAs: ['https://twitter.com/safetynewspro', 'https://linkedin.com/company/safetynewspro'],
  publishingPrinciples: 'https://safetynews.pro/editorial-standards',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${inter.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
