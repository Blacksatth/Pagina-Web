'use client'

import './globals.css'
import { CartProvider } from '@/app/context/CartContext'
import Header from '@/app/components/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-white">
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
