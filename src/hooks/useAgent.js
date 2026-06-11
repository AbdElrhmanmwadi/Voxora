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
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)

  // Ignore responses that arrive after the project changed.
  const projectRef = useRef(projectId)
  // In-flight stream, so "stop"/unmount/project switch can cancel it.
  const abortRef = useRef(null)
  // Last user text, so a failed answer can be retried with the same message.
  const lastSentRef = useRef(null)

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
    if (abortRef.current) abortRef.current.abort()
    setMessages([])
    setSessions([])
    setCurrentSessionId(null)
    setError(null)
    const saved = readSavedSessionId(projectId)
    // Session ids are integers server-side; sessionStorage returns strings.
    if (saved) void loadSession(/^\d+$/.test(saved) ? Number(saved) : saved)
  }, [projectId, loadSession])

  // Cancel any in-flight stream when the chat unmounts.
  useEffect(() => () => {
    if (abortRef.current) abortRef.current.abort()
  }, [])

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
    async (text, { isRetry = false } = {}) => {
      if (!text) return
      lastSentRef.current = text
      const controller = new AbortController()
      abortRef.current = controller

      setError(null)
      setIsLoading(true)
      setIsStreaming(true)
      setMessages((prev) => {
        // On retry drop the failed bubble and re-send the same user message
        // (the backend does not save partial answers, so nothing is duplicated).
        const base = isRetry
          ? prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant' && m.failed))
          : [...prev, { role: 'user', content: text }]
        return [...base, { role: 'assistant', content: '', sources: [], tool_trace: [], streaming: true }]
      })

      // The send box is disabled while streaming, so the placeholder we just
      // appended stays the last message for the whole stream.
      const patchLast = (patch) => {
        if (projectRef.current !== projectId) return
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          const next = [...prev]
          next[next.length - 1] = typeof patch === 'function' ? patch(last) : { ...last, ...patch }
          return next
        })
      }

      try {
        await api.streamChat(
          projectId,
          { message: text, sessionId: currentSessionId },
          {
            onMeta: (m) => {
              if (projectRef.current !== projectId) return
              if (m && m.session_id) {
                setCurrentSessionId(m.session_id)
                saveSessionId(projectId, m.session_id)
              }
              // Sources arrive before the first token; render them right away.
              patchLast({ sources: (m && m.sources) || [], tool_trace: (m && m.tool_trace) || [] })
            },
            onDelta: (chunk) => patchLast((last) => ({ ...last, content: last.content + chunk })),
            // done.answer == concatenated deltas; replacing guards against a dropped chunk.
            onDone: (answer) => patchLast({ content: answer, streaming: false }),
            // The failed bubble (with Retry) is the error surface for sends;
            // the top-level error banner stays for session-load failures.
            onError: (detail) => patchLast({ streaming: false, failed: true, error: detail }),
          },
          controller.signal
        )
        // refresh sessions list to include new/updated session
        if (projectRef.current === projectId) await loadSessions()
      } catch (e) {
        if (e && e.name === 'AbortError') {
          patchLast((last) => ({ ...last, streaming: false, failed: true, error: 'Stopped' }))
        } else {
          patchLast((last) => ({ ...last, streaming: false, failed: true, error: e.message || 'Request failed' }))
        }
      } finally {
        abortRef.current = null
        if (projectRef.current === projectId) {
          setIsLoading(false)
          setIsStreaming(false)
        }
      }
    },
    [projectId, currentSessionId, loadSessions]
  )

  const stopStreaming = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
  }, [])

  const retryLast = useCallback(() => {
    if (lastSentRef.current && !abortRef.current) void sendMessage(lastSentRef.current, { isRetry: true })
  }, [sendMessage])

  return {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    isStreaming,
    error,
    loadSessions,
    loadSession,
    deleteSession,
    startNewChat,
    sendMessage,
    stopStreaming,
    retryLast,
  }
}
