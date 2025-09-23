'use client'

import './globals.css'
import { CartProvider } from '@/app/context/CartContext'
import Header from '@/app/components/Header'
import { UserProvider } from '@/app/context/UserContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-950 text-white">
        <UserProvider>
          <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
        </UserProvider>
        
      </body>
    </html>
  )
}
