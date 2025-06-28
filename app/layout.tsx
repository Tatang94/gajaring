import type { Metadata } from 'next'
import { GlobalContextProviders } from '../components/_globalContextProviders'
import '../global.css'
import '../CombiniSetup.css'

export const metadata: Metadata = {
  title: 'GAJARING - Social Network',
  description: 'Connect, Share, Engage with GAJARING',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GlobalContextProviders>
          {children}
        </GlobalContextProviders>
      </body>
    </html>
  )
}