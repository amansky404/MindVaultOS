import '@/app/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MindVault OS - Local Encrypted Productivity System',
  description: 'Secure local-only encrypted productivity system with keystroke memory, clipboard history, and smart AutoFill',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100">{children}</body>
    </html>
  )
}
