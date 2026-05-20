import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Zenler ↔ GHL Connector | devdelulu',
  description: 'Real-time bidirectional sync between Zenler and GoHighLevel. Connect in minutes.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-navy-950 text-slate-100 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111c30',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f1f5f9',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
