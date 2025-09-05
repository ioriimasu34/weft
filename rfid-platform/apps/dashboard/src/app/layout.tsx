import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RFID Platform Dashboard',
  description: 'Enterprise-grade RFID tracking system for textile & apparel factories',
  keywords: ['RFID', 'tracking', 'textile', 'factory', 'manufacturing'],
  authors: [{ name: 'StitchOS Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'RFID Platform Dashboard',
    description: 'Real-time RFID tracking system for textile factories',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RFID Platform Dashboard',
    description: 'Real-time RFID tracking system for textile factories',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1f2937',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}