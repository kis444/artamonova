import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Alexandra Artamonova | Private English Teacher',
  description:
    'Premium private English lessons with Alexandra Artamonova. Master your English with personalized one-on-one tutoring for all levels.',
  keywords: ['English teacher', 'private lessons', 'English tutor', 'online English', 'IELTS preparation', 'Cambridge exam'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning> 
       <body className="font-sans antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}