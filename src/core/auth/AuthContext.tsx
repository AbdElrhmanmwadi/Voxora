import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_TOKENS_CHANGED_EVENT, clearTokens, getAccessToken, getRefreshToken, setTokens } from './authStorage'
import {
  googleLoginRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  type RegisterPayload
} from '../../features/auth/api/authApi'

type AuthContextValue = {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken())
  const [refreshToken, setRefreshToken] = useState<string | null>(() => getRefreshToken())

  useEffect(() => {
    function syncTokens() {
      setAccessToken(getAccessToken())
      setRefreshToken(getRefreshToken())
    }

    window.addEventListener(AUTH_TOKENS_CHANGED_EVENT, syncTokens)
    window.addEventListener('storage', syncTokens)

    return () => {
      window.removeEventListener(AUTH_TOKENS_CHANGED_EVENT, syncTokens)
      window.removeEventListener('storage', syncTokens)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    setTokens(response.access_token, response.refresh_token)
    setAccessToken(response.access_token)
    setRefreshToken(response.refresh_token)
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await googleLoginRequest(idToken)
    setTokens(response.access_token, response.refresh_token)
    setAccessToken(response.access_token)
    setRefreshToken(response.refresh_token)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerRequest(payload)
  }, [])

  const logout = useCallback(async () => {
    const token = getRefreshToken()
    clearTokens()
    setAccessToken(null)
    setRefreshToken(null)

    if (token) {
      try {
        await logoutRequest(token)
      } catch {
        // Local logout must succeed even if the backend session cleanup fails.
      }
    }

    window.location.assign('/login')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken),
      login,
      loginWithGoogle,
      register,
      logout
    }),
    [accessToken, refreshToken, login, loginWithGoogle, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
