import { useState, useCallback, useEffect, useRef } from 'react'
import * as api from '../api/agent'

const sessionStorageKey = (projectId) => `rag:agentSession:${projectId}`

function readSavedSessionId(projectId) {
  try {
    return sessionStorage.getItem(sessionStorageKey(projectId))
  } catch {
    return null
  }
}

function saveSessionId(projectId, sessionId) {
  try {
    if (sessionId) sessionStorage.setItem(sessionStorageKey(projectId), String(sessionId))
    else sessionStorage.removeItem(sessionStorageKey(projectId))
  } catch {
    // ignore storage errors (private mode / quota)
  }
}

function toList(data, key) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data[key])) return data[key]
  if (data && Array.isArray(data.data)) return data.data
  return []
}

// Backends vary in field naming; map common shapes to { session_id, title }.
export function sessionId(session) {
  if (!session || typeof session !== 'object') return null
  return session.session_id ?? session.id ?? session._id ?? null
}

function normalizeMessage(m) {
  if (!m || typeof m !== 'object') return { role: 'assistant', content: String(m ?? '') }
  const role = m.role || m.sender || (m.is_user ? 'user' : 'assistant')
  const content = m.content ?? m.text ?? m.message ?? ''
  return { ...m, role, content }
}

export default function useAgent(projectId) {
  const [messages, setMessages] = useState([])
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Ignore responses that arrive after the project changed.
  const projectRef = useRef(projectId)

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.getSessions(projectId)
      if (projectRef.current !== projectId) return
      setSessions(toList(data, 'sessions'))
    } catch (e) {
      if (projectRef.current === projectId) setError(e)
    }
  }, [projectId])

  const loadSession = useCallback(
    async (id) => {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const data = await api.getSessionMessages(projectId, id)
        if (projectRef.current !== projectId) return
        // Backend nests the detail: { signal, session: { ..., messages: [...] } }
        const detail = data && typeof data === 'object' && data.session ? data.session : data
        const resolvedId = sessionId(detail) ?? id
        setMessages(toList(detail, 'messages').map(normalizeMessage))
        setCurrentSessionId(resolvedId)
        saveSessionId(projectId, resolvedId)
      } catch (e) {
        if (projectRef.current !== projectId) return
        setError(e)
        // The saved session no longer exists on the server; forget it.
        if (e && e.status === 404) {
          saveSessionId(projectId, null)
          setCurrentSessionId(null)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [projectId]
  )

  // Reset on project switch, then restore the last open session (if any) so
  // navigating away from the page and back does not lose the conversation.
  useEffect(() => {
    projectRef.current = projectId
    setMessages([])
    setSessions([])
    setCurrentSessionId(null)
    setError(null)
    const saved = readSavedSessionId(projectId)
    // Session ids are integers server-side; sessionStorage returns strings.
    if (saved) void loadSession(/^\d+$/.test(saved) ? Number(saved) : saved)
  }, [projectId, loadSession])

  const startNewChat = useCallback(() => {
    setMessages([])
    setCurrentSessionId(null)
    setError(null)
    saveSessionId(projectId, null)
  }, [projectId])

  const deleteSession = useCallback(
    async (id) => {
      setIsLoading(true)
      try {
        await api.deleteSession(projectId, id)
        await loadSessions()
        if (String(id) === String(currentSessionId ?? '')) startNewChat()
        if (String(id) === String(readSavedSessionId(projectId) ?? '')) saveSessionId(projectId, null)
      } catch (e) {
        setError(e)
      } finally {
        setIsLoading(false)
      }
    },
    [projectId, currentSessionId, loadSessions, startNewChat]
  )

  const sendMessage = useCallback(
    async (text) => {
      if (!text) return
      const userMsg = { role: 'user', content: text }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.chatWithAgent(projectId, text, currentSessionId)
        if (projectRef.current !== projectId) return res
        const assistantMsg = {
          role: 'assistant',
          content: res.answer || '',
          sources: res.sources || [],
          tool_trace: res.tool_trace || [],
        }
        setMessages((prev) => [...prev, assistantMsg])
        if (res.session_id) {
          setCurrentSessionId(res.session_id)
          saveSessionId(projectId, res.session_id)
        }
        // refresh sessions list to include new/updated session
        await loadSessions()
        return res
      } catch (e) {
        if (projectRef.current === projectId) {
          setError(e)
          setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: ' + (e.message || 'Request failed') }])
        }
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [projectId, currentSessionId, loadSessions]
  )

  return {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    error,
    loadSessions,
    loadSession,
    deleteSession,
    startNewChat,
    sendMessage,
  }
}
