import { useState, useCallback, useEffect, useRef } from 'react'
import * as api from '../api/agent'

function toList(data, key) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data[key])) return data[key]
  if (data && Array.isArray(data.data)) return data.data
  return []
}

export default function useAgent(projectId) {
  const [messages, setMessages] = useState([])
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Ignore responses that arrive after the project changed.
  const projectRef = useRef(projectId)

  useEffect(() => {
    projectRef.current = projectId
    setMessages([])
    setSessions([])
    setCurrentSessionId(null)
    setError(null)
  }, [projectId])

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
    async (sessionId) => {
      setIsLoading(true)
      try {
        const data = await api.getSessionMessages(projectId, sessionId)
        if (projectRef.current !== projectId) return
        setMessages(toList(data, 'messages'))
        setCurrentSessionId(sessionId)
      } catch (e) {
        if (projectRef.current === projectId) setError(e)
      } finally {
        setIsLoading(false)
      }
    },
    [projectId]
  )

  const startNewChat = useCallback(() => {
    setMessages([])
    setCurrentSessionId(null)
  }, [])

  const deleteSession = useCallback(
    async (sessionId) => {
      setIsLoading(true)
      try {
        await api.deleteSession(projectId, sessionId)
        await loadSessions()
        if (sessionId === currentSessionId) startNewChat()
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
        if (res.session_id) setCurrentSessionId(res.session_id)
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
