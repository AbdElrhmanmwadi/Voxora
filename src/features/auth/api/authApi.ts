import axiosClient from '../../../core/api/axiosClient'

export type RegisterPayload = {
  email: string
  username: string
  password: string
}

export type AuthTokensResponse = {
  access_token: string
  refresh_token: string
  token_type: string
}

export async function loginRequest(email: string, password: string) {
  const res = await axiosClient.post<AuthTokensResponse>('/auth/login', { email, password })
  return res.data
}

export async function googleLoginRequest(idToken: string) {
  const res = await axiosClient.post<AuthTokensResponse>('/auth/google', { id_token: idToken })
  return res.data
}

export async function registerRequest(payload: RegisterPayload) {
  const res = await axiosClient.post<{ message: string }>('/auth/register', payload)
  return res.data
}

export async function verifyEmailRequest(token: string) {
  const res = await axiosClient.get<{ message: string }>('/auth/verify-email', { params: { token } })
  return res.data
}

export async function logoutRequest(refreshToken: string) {
  const res = await axiosClient.post<{ message?: string }>('/auth/logout', { refresh_token: refreshToken })
  return res.data
}

export async function requestPasswordResetRequest(email: string) {
  const res = await axiosClient.post<{ message: string }>('/auth/request-password-reset', { email })
  return res.data
}

export async function resetPasswordRequest(token: string, newPassword: string) {
  const res = await axiosClient.post<{ message: string }>('/auth/reset-password', { token, new_password: newPassword })
  return res.data
}
