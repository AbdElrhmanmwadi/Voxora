import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/authStorage'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export class ApiClientError extends Error {
  status?: number
  // Raw response body, so callers can branch on a backend `signal` field
  // instead of parsing the (now intentionally generic) human message.
  data?: unknown

  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}

function getApiBaseUrl() {
  const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

  if (import.meta.env.PROD && (!rawBaseUrl || rawBaseUrl === '/')) {
    throw new Error('VITE_API_BASE_URL must be set to the deployed backend URL in production.')
  }

  if (!rawBaseUrl || rawBaseUrl === '/') return ''

  return rawBaseUrl.replace(/\/$/, '')
}

const API_BASE_URL = getApiBaseUrl()

const axiosClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: { 'Content-Type': 'application/json' }
})

function isAuthEndpoint(url?: string) {
  return Boolean(
    url?.startsWith('/auth/login') ||
      url?.startsWith('/auth/google') ||
      url?.startsWith('/auth/register') ||
      url?.startsWith('/auth/refresh') ||
      url?.startsWith('/auth/request-password-reset') ||
      url?.startsWith('/auth/reset-password')
  )
}

function toApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    let message = error.message || 'Unknown error'
    if (data) {
      if (typeof data.detail === 'string') message = data.detail
      else if (typeof data.message === 'string') message = data.message
      else {
        try {
          message = JSON.stringify(data)
        } catch {
          message = String(data)
        }
      }
    }
    return new ApiClientError(message, error.response?.status, data)
  }
  if (error instanceof Error) return error
  return new Error('Unknown error')
}

axiosClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Single-flight refresh: concurrent 401s share one refresh request so a rotated
// refresh token is never consumed twice (which would invalidate the session).
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((response) => {
        const accessToken = response.data.access_token as string
        const nextRefreshToken = response.data.refresh_token as string
        setTokens(accessToken, nextRefreshToken)
        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const refreshToken = getRefreshToken()

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && refreshToken && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true

      try {
        const accessToken = await refreshAccessToken(refreshToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosClient(originalRequest)
      } catch (refreshError) {
        clearTokens()
        if (window.location.pathname !== '/login') window.location.assign('/login')
        return Promise.reject(toApiError(refreshError))
      }
    }

    return Promise.reject(toApiError(error))
  }
)

export default axiosClient
