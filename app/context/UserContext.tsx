'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type UserContextType = {
  email: string | null
  role: string | null
  setUser: (email: string, role: string) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const storedEmail = localStorage.getItem('email')
    const storedRole = localStorage.getItem('role')
    if (storedEmail) setEmail(storedEmail)
    if (storedRole) setRole(storedRole)
  }, [])

  const setUser = (email: string, role: string) => {
    localStorage.setItem('email', email)
    localStorage.setItem('role', role)
    setEmail(email)
    setRole(role)
  }

  const logout = () => {
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    localStorage.removeItem('token')
    setEmail(null)
    setRole(null)
  }

  return (
    <UserContext.Provider value={{ email, role, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}
