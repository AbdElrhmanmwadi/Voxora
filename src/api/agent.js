import axiosClient from '../core/api/axiosClient'

// Shared client: attaches the bearer token, refreshes it on 401, and
// normalizes backend error messages.

export async function chatWithAgent(projectId, message, sessionId) {
  const body = { message }
  if (sessionId) body.session_id = sessionId
  const res = await axiosClient.post(`/api/v1/agent/chat/${projectId}`, body)
  return res.data
}

export async function getSessions(projectId) {
  const res = await axiosClient.get(`/api/v1/agent/sessions/${projectId}`)
  return res.data
}

export async function getSessionMessages(projectId, sessionId) {
  const res = await axiosClient.get(`/api/v1/agent/sessions/${projectId}/${sessionId}`)
  return res.data
}

export async function deleteSession(projectId, sessionId) {
  const res = await axiosClient.delete(`/api/v1/agent/sessions/${projectId}/${sessionId}`)
  return res.data
}

export default { chatWithAgent, getSessions, getSessionMessages, deleteSession }
