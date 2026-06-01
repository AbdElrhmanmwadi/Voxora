import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../auth/authStorage'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export class ApiClientError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const axiosClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: { 'Content-Type': 'application/json' }
})

function isAuthEndpoint(url?: string) {
  return Boolean(
    url?.startsWith('/auth/login') ||
      url?.startsWith('/auth/google') ||
      url?.startsWith('/auth/register') ||
      url?.startsWith('/auth/refresh')
  )
}

function toApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail
    const message = typeof detail === 'string' ? detail : error.message || 'Unknown error'
    return new ApiClientError(message, error.response?.status)
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

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const refreshToken = getRefreshToken()

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && refreshToken && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )
        const accessToken = response.data.access_token as string
        const nextRefreshToken = response.data.refresh_token as string
        setTokens(accessToken, nextRefreshToken)
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
