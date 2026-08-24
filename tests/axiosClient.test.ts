import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios, { AxiosError } from 'axios'
import axiosClient, { refreshAccessToken, toApiError } from '../src/core/api/axiosClient'

function storage() {
  const values = new Map<string, string>()
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) }
}

beforeEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(globalThis, 'localStorage', { value: storage(), configurable: true })
  Object.defineProperty(globalThis, 'window', { value: { location: { pathname: '/projects/1', assign: vi.fn() }, dispatchEvent: vi.fn() }, configurable: true })
})

describe('API client', () => {
  it('refreshes tokens through same-origin /auth/refresh', async () => {
    localStorage.setItem('refresh_token', 'old-refresh')
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { access_token: 'new-access', refresh_token: 'new-refresh' } })
    await expect(refreshAccessToken()).resolves.toBe('new-access')
    expect(axios.post).toHaveBeenCalledWith('/auth/refresh', { refresh_token: 'old-refresh' }, expect.any(Object))
    expect(localStorage.getItem('access_token')).toBe('new-access')
  })

  it('retries one protected 401 request after refreshing', async () => {
    localStorage.setItem('refresh_token', 'refresh')
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { access_token: 'new-access', refresh_token: 'new-refresh' } })
    const retry = vi.spyOn(axiosClient, 'request').mockResolvedValue({ data: { ok: true } } as never)
    const rejected = (axiosClient.interceptors.response as any).handlers.find((handler: any) => handler.rejected).rejected
    const error = new AxiosError('Unauthorized', undefined, { url: '/api/v1/projects', headers: {} } as any, undefined, { status: 401, data: {} } as any)
    await expect(rejected(error)).resolves.toEqual({ data: { ok: true } })
    expect(retry).toHaveBeenCalledOnce()
  })

  it.each([[403, 'You do not have access to this project.'], [413, 'The uploaded file exceeds the allowed size.']] as const)('maps HTTP %i safely', (status, message) => {
    const error = new AxiosError('Request failed', undefined, undefined, undefined, { status, data: { detail: 'internal detail' } } as any)
    expect(toApiError(error).message).toBe(message)
  })
})
