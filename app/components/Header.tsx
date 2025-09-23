'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'

export default function Header() {
  const { email, role, logout } = useUser()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '#productos', label: 'Productos' },
    { href: '#contacto', label: 'Contacto' },
  ]

  if (!email) {
    navLinks.push({ href: '/inicio', label: 'Iniciar sesión' })
    navLinks.push({ href: '/registro', label: 'Registrarse' })
  } else if (role === 'admin') {
    navLinks.push({ href: '/admin', label: 'Admin' })
  }

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold hover:text-green-400">
          🧢 Blacksath
        </Link>

        <div className="flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-green-400">
              {label}
            </Link>
          ))}

          {email && (
            <>
              <span className="text-gray-300">👤 {email}</span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-500"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
