import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified?: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

interface AuthProviderProps {
  children: ReactNode
  initialUser?: AuthUser | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let unsubscribe: (() => void) | undefined

    import('./firebase-client').then((mod) => {
      unsubscribe = mod.onAuthStateChanged(mod.auth, (fbUser) => {
        setUser(
          fbUser
            ? { uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName }
            : null,
        )
        setLoading(false)
      })
    })

    return () => unsubscribe?.()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
