'use client'

import useAuth from '../hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter } from 'next/navigation'

interface Props {
  onLogout?: () => void
}

export default function UserInfo({ onLogout }: Props) {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    if (onLogout) {
      onLogout()
    } else {
      router.push('/')
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto justify-center sm:justify-end">
      <p className="bg-gray-700 px-3 py-1 rounded font-semibold text-sm text-center w-full sm:w-auto">
        Bienvenido, {user.displayName || user.email}
      </p>
    </div>
  )
}
