import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'get your vinyl',
  description: 'Create your personalised virtual vinyl record',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
