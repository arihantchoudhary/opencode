"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./api"

type AuthContextType = {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
})

const STORAGE_KEY = "stardrop_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setUserState(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  function setUser(u: User) {
    setUserState(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  function logout() {
    setUserState(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
