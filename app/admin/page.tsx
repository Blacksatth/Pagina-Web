'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getIdTokenResult } from 'firebase/auth'
import useAuth from '../hooks/useAuth'
import AdminPanel from '../components/AdminPanel'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && user) {
        const tokenResult = await getIdTokenResult(user)
        const isAdminClaim = tokenResult.claims.admin === true
        setIsAdmin(isAdminClaim)
        setCheckingAdmin(false)

        if (!isAdminClaim) {
          console.warn('⛔ No eres admin')
          router.push('/')
        }
      } else if (!loading && !user) {
        router.push('/login')
      }
    }

    checkAdmin()
  }, [user, loading, router])

  if (loading || checkingAdmin) {
    return <p className="text-center mt-10">Verificando acceso...</p>
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white px-4 py-10">
      {isAdmin ? <AdminPanel /> : <p className="text-center mt-10">Acceso denegado</p>}
    </main>
  )
}
