import axiosClient from '../core/api/axiosClient'
import { getAccessToken } from '../core/auth/authStorage'

// Shared client: attaches the bearer token, refreshes it on 401, and
// normalizes backend error messages.

export async function chatWithAgent(projectId, message, sessionId) {
  const body = { message }
  if (sessionId) body.session_id = sessionId
  const res = await axiosClient.post(`/api/v1/agent/chat/${projectId}`, body)
  return res.data
}

// Streaming chat over SSE (see rag-knowledge-engine/docs/agent-streaming-frontend-prompt.md).
// Native EventSource cannot POST a body or send Authorization, so the stream
// is read from fetch. Events: meta (once, first) -> delta (0..n) -> done | error.
export async function streamChat(projectId, { message, sessionId, limit }, handlers, signal) {
  const base = axiosClient.defaults.baseURL || ''
  const body = { message, stream: true }
  if (sessionId) body.session_id = sessionId
  if (limit) body.limit = limit

  const res = await fetch(`${base}/api/v1/agent/chat/${projectId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken() || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (res.status === 401) {
    // Expired access token: fetch bypasses the axios interceptors, so route
    // this one message through axios (which refreshes and retries). The
    // answer arrives non-streamed this once; the next message streams again.
    const data = await chatWithAgent(projectId, message, sessionId)
    handlers.onMeta({ session_id: data.session_id, sources: data.sources || [], tool_trace: data.tool_trace || [] })
    handlers.onDone(data.answer || '')
    return
  }

  const contentType = res.headers.get('content-type') || ''
  if (!res.ok || !contentType.includes('text/event-stream')) {
    const json = await res.json().catch(() => null)
    if (res.ok && json && json.answer) {
      // Older backend without streaming: full answer in one JSON response.
      handlers.onMeta({ session_id: json.session_id, sources: json.sources || [], tool_trace: json.tool_trace || [] })
      handlers.onDone(json.answer)
    } else {
      handlers.onError((json && json.detail) || `HTTP ${res.status}`)
    }
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let sawTerminal = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sep
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)

      let event = ''
      let data = ''
      for (const line of block.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim()
        else if (line.startsWith('data: ')) data = line.slice(6)
      }
      if (!data) continue

      let payload
      try {
        payload = JSON.parse(data)
      } catch {
        continue
      }

      if (event === 'meta') handlers.onMeta(payload)
      else if (event === 'delta') handlers.onDelta(payload.text || '')
      else if (event === 'done') {
        sawTerminal = true
        handlers.onDone(payload.answer || '')
      } else if (event === 'error') {
        sawTerminal = true
        handlers.onError(payload.detail || 'Stream error')
      }
    }
  }

  if (!sawTerminal) handlers.onError('Connection lost before the answer finished')
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

export default { chatWithAgent, streamChat, getSessions, getSessionMessages, deleteSession }
