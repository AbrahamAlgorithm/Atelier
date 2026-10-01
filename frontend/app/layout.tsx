import type { Metadata } from 'next'
import { Newsreader } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-newsreader',
})

export const metadata: Metadata = {
  title: 'Atelier AI — Fashion Design Tools',
  description: 'Ghost mannequin, sewing pattern generator, and virtual try-on for fashion designers.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${newsreader.variable}`}>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
