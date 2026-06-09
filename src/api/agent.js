import axios from 'axios'

// Use Vite proxy / env to reach backend during development.
const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''
const api = axios.create({ baseURL: apiBase })

// Attach bearer token from localStorage for every request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore in non-browser environments
  }
  return config
})

export async function chatWithAgent(projectId, message, sessionId) {
  const body = { message }
  if (sessionId) body.session_id = sessionId
  const res = await api.post(`/api/v1/agent/chat/${projectId}`, body)
  return res.data
}

export async function getSessions(projectId) {
  const res = await api.get(`/api/v1/agent/sessions/${projectId}`)
  return res.data
}

export async function getSessionMessages(projectId, sessionId) {
  const res = await api.get(`/api/v1/agent/sessions/${projectId}/${sessionId}`)
  return res.data
}

export async function deleteSession(projectId, sessionId) {
  const res = await api.delete(`/api/v1/agent/sessions/${projectId}/${sessionId}`)
  return res.data
}

export default { chatWithAgent, getSessions, getSessionMessages, deleteSession }
