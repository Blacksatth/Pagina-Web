'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminPanel from '../components/AdminPanel'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const token = localStorage.getItem('token') // token JWT de sesión
      if (!token) {
        setLoading(false)
        router.replace('/login')
        return
      }

      try {
        const res = await fetch('http://localhost:3001/verify-admin', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          setLoading(false)
          router.replace('/')
          return
        }

        const data = await res.json()
        console.log('Role recibido desde PHP:', data.role)

        if (data.role && data.role.toLowerCase() === 'admin') {
          setHasAccess(true) // ✅ Solo permitimos admins
        } else {
          router.replace('/')
        }
      } catch (err) {
        console.error('Error verificando rol:', err)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    checkRole()
  }, [router])

  if (loading) return <p className="text-center mt-10">Verificando acceso...</p>
  if (!hasAccess) return <p className="text-center mt-10">No tienes acceso</p>

  // 🔹 Renderizamos AdminPanel solo si el usuario es admin
  return <AdminPanel />
}
