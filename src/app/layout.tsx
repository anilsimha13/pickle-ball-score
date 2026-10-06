import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import { CourtBackground } from '@/components/layout/CourtBackground'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Providers } from '@/components/ui/Providers'

const bebasNeue = Bebas_Neue({
  weight: '400',
  variable: '--font-bebas',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Pickle Ball Score',
  description: 'Pickleball tournament organizer',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg font-body text-net">
        <CourtBackground />
        <Providers>
          <Navbar />
          <main className="relative z-10 flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
