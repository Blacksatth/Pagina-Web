'use client'

import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Redirige si ya está logueado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/admin')
      }
    })
    return () => unsubscribe()
  }, [router])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

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
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/admin')
    } catch (err: unknown) {
      const errorMap: { [key: string]: string } = {
        'auth/user-not-found': 'Usuario no encontrado.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-email': 'Correo inválido.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
      }

      if (typeof err === 'object' && err !== null && 'code' in err) {
        const errorCode = (err as { code: string }).code
        setError(errorMap[errorCode] || 'Error al iniciar sesión.')
      } else {
        setError('Error desconocido al iniciar sesión.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/admin')
    } catch {
      setError('Error al iniciar sesión con Google.')
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

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`w-full px-4 py-2 rounded transition ${
          loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Cargando...' : 'Iniciar sesión con Google'}
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
