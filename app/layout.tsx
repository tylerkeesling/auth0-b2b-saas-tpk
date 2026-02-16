import type { Metadata } from 'next'

import './globals.css'
import './themes.css'

import {
  IBM_Plex_Mono,
  Inter,
  Lora,
  Open_Sans,
  Plus_Jakarta_Sans,
  Poppins,
  Roboto_Mono,
  Source_Serif_4,
} from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' })
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
})
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
})
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' })
const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif-4',
})

const fontVariables = [
  inter.variable,
  plusJakarta.variable,
  lora.variable,
  ibmPlexMono.variable,
  poppins.variable,
  robotoMono.variable,
  openSans.variable,
  sourceSerif4.variable,
].join(' ')

export const metadata: Metadata = {
  title: 'Tylers demo app',
  description:
    'SaaStart is a reference B2B SaaS application built using Next.js and Auth0 by Okta.',
  metadataBase: new URL('https://saastart.app'),
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('color-theme');if(t&&t!=='default')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-background min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
