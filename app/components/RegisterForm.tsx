'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      setSuccess(true)
      setEmail('')
      setPassword('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error desconocido al registrar.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 max-w-md mx-auto rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">📝 Registro</h2>

      {success && (
        <p className="text-green-400 mb-4 text-center">
          ¡Usuario registrado exitosamente!
        </p>
      )}
      {error && (
        <p className="text-red-500 mb-4 text-center">{error}</p>
      )}

      <input
        type="email"
        placeholder="Correo electrónico"
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
        onClick={handleRegister}
        disabled={loading}
        className="bg-green-600 px-4 py-2 rounded w-full hover:bg-green-700 transition"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </div>
  )
}
