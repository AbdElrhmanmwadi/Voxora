import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  AUTH_TOKENS_CHANGED_EVENT,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens,
  type StoredAuthUser
} from './authStorage'
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
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

type AuthUser = StoredAuthUser

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeTokenUser(token: string | null): AuthUser | null {
  if (!token) return null

  const [, payload] = token.split('.')
  if (!payload) return null

  try {
    const decodedPayload = JSON.parse(decodeBase64UrlJson(payload)) as Record<string, unknown>
    const username =
      typeof decodedPayload.username === 'string'
        ? decodedPayload.username
        : typeof decodedPayload.preferred_username === 'string'
          ? decodedPayload.preferred_username
          : typeof decodedPayload.user_name === 'string'
            ? decodedPayload.user_name
            : undefined
    const name =
      typeof decodedPayload.name === 'string'
        ? decodedPayload.name
        : typeof decodedPayload.full_name === 'string'
          ? decodedPayload.full_name
          : typeof decodedPayload.display_name === 'string'
            ? decodedPayload.display_name
            : undefined
    const email = typeof decodedPayload.email === 'string' ? decodedPayload.email : undefined

    if (!username && !name && !email) return null

    return { username, name, email }
  } catch {
    return null
  }
}

function decodeBase64UrlJson(value: string) {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddedValue = normalizedValue.padEnd(normalizedValue.length + ((4 - normalizedValue.length % 4) % 4), '=')
  const binaryValue = window.atob(paddedValue)
  const bytes = Uint8Array.from(binaryValue, (char) => char.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

function mergeUser(primary: AuthUser | null, fallback: AuthUser | null): AuthUser | null {
  if (!primary && !fallback) return null

  return {
    username: primary?.username || fallback?.username,
    name: primary?.name || fallback?.name,
    email: primary?.email || fallback?.email
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken())
  const [refreshToken, setRefreshToken] = useState<string | null>(() => getRefreshToken())
  const [storedUser, setStoredUserState] = useState<AuthUser | null>(() => getStoredUser())

  useEffect(() => {
    function syncTokens() {
      setAccessToken(getAccessToken())
      setRefreshToken(getRefreshToken())
      setStoredUserState(getStoredUser())
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
    setStoredUser(mergeUser(decodeTokenUser(response.access_token), { email }))
    setTokens(response.access_token, response.refresh_token)
    setAccessToken(response.access_token)
    setRefreshToken(response.refresh_token)
    setStoredUserState(getStoredUser())
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await googleLoginRequest(idToken)
    setStoredUser(mergeUser(decodeTokenUser(response.access_token), decodeTokenUser(idToken)))
    setTokens(response.access_token, response.refresh_token)
    setAccessToken(response.access_token)
    setRefreshToken(response.refresh_token)
    setStoredUserState(getStoredUser())
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerRequest(payload)
  }, [])

  const logout = useCallback(async () => {
    const token = getRefreshToken()
    clearTokens()
    setAccessToken(null)
    setRefreshToken(null)
    setStoredUserState(null)

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
      user: mergeUser(decodeTokenUser(accessToken), storedUser),
      isAuthenticated: Boolean(accessToken),
      login,
      loginWithGoogle,
      register,
      logout
    }),
    [accessToken, refreshToken, storedUser, login, loginWithGoogle, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
