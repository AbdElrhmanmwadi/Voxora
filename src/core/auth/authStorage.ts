const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const AUTH_USER_KEY = 'auth_user'
export const AUTH_TOKENS_CHANGED_EVENT = 'auth:tokens-changed'

export type StoredAuthUser = {
  username?: string
  name?: string
  email?: string
}

function emitTokenChange() {
  window.dispatchEvent(new Event(AUTH_TOKENS_CHANGED_EVENT))
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): StoredAuthUser | null {
  const storedUser = localStorage.getItem(AUTH_USER_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as StoredAuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: StoredAuthUser | null) {
  if (user?.username || user?.name || user?.email) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_USER_KEY)
  }

  emitTokenChange()
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  emitTokenChange()
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  emitTokenChange()
}
