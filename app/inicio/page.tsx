'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useUser()

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleLogin = async () => {
    setError('')
    if (!email || !password) {
      setError('Por favor, completa todos los campos.')
      return
    }
    if (!validateEmail(email)) {
      setError('El correo no es válido.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error desconocido')
        return
      }

      localStorage.setItem('token', data.token)
      setUser(email, data.role)

      router.push(data.role === 'admin' ? '/admin' : '/')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Error desconocido al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 max-w-md mx-auto rounded-xl mt-10 text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 Iniciar sesión</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <input
        type="email"
        placeholder="Correo"
        className="w-full mb-3 p-2 rounded bg-gray-700"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        className="w-full mb-3 p-2 rounded bg-gray-700"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full px-4 py-2 rounded transition mb-3 ${
          loading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>

      <div className="text-center mt-6">
        <p className="text-gray-400 mt-4">¿No tienes cuenta?</p>
        <a href="/registro" className="text-blue-500 hover:underline">
          Regístrate aquí
        </a>
      </div>
    </div>
  )
}
