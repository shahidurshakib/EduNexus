
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('edunexus_user')
    return raw ? JSON.parse(raw) : null
  })

  const [loading, setLoading] = useState(true)

  const persist = (u, token) => {
    setUser(u)

    if (u) {
      localStorage.setItem('edunexus_user', JSON.stringify(u))
    } else {
      localStorage.removeItem('edunexus_user')
    }

    if (token) {
      localStorage.setItem('edunexus_access_token', token)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('edunexus_access_token')

    if (!token) {
      setLoading(false)
      return
    }

    authApi.me()
      .then((data) => persist(data.user || data))
      .catch(() => persist(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    persist(data.user, data.accessToken)
    return data.user
  }, [])

  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await authApi.googleLogin(idToken)
    persist(data.user, data.accessToken)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (e) {
      // Ignore logout API errors
    }

    persist(null)
    localStorage.removeItem('edunexus_access_token')
  }, [])

  const refreshMe = useCallback(async () => {
    const data = await authApi.me()
    persist(data.user || data)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        refreshMe,
        setUser: persist
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
