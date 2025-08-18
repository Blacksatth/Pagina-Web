'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/app/lib/firebase'
import UserInfo from './UserInfo'


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const toggleMenu = () => setMenuOpen(!menuOpen)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    setMenuOpen(false)
    router.refresh()
  }

  const isAdmin = user?.email === 'santiagocifuenteslora@gmail.com'

 const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '#productos', label: 'Productos' },
  { href: '#contacto', label: 'Contacto' },
]

if (!user) {
  navLinks.push({ href: '/inicio', label: 'Iniciar sesión' })
  navLinks.push({ href: '/registro', label: 'Registrarse' })
} else if (isAdmin) {
  navLinks.push({ href: '/admin', label: 'Admin' })
}


  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
      {/* Overlay blur */}
      
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar móvil */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-semibold">Menú</h2>
          <button onClick={toggleMenu}>
          
          </button>
        </div>
        <nav className="p-4 space-y-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={toggleMenu}
              className="block text-lg hover:text-green-400 transition"
            >
              {label}
            </Link>
          ))}
        </nav>

        {user && (
          
          <div className="px-4 mt-6 border-t border-gray-700 pt-4">
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
            >
             
              Cerrar sesión
            </button>
            
          </div>
        )}
      </aside>

      {/* Header principal */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between relative">
        {/* Menú hamburguesa */}
        <div className="lg:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Abrir menú"
            className="p-2 rounded hover:bg-gray-800 transition"
          >
          
          </button>
        </div>
<UserInfo/>
        {/* Título centrado */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="/"
            className="text-xl lg:text-2xl font-bold hover:text-green-400 transition"
          >
            🧢 GorraStyssssssssle
          </Link>
        </div>

        {/* Navegación escritorio */}
        <div className="hidden lg:flex items-center space-x-6 ml-auto text-sm font-medium">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-green-400 transition"
            >
              {label}
            </Link>
          ))}
        

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-400 hover:text-red-500 transition text-sm"
            >
            
              Cerrar sesión
            </button>
          )}
        </div>

        {/* Icono carrito móvil */}
        <div className="lg:hidden ml-auto">
          
        </div>
      </div>
    </header>
  )
}
