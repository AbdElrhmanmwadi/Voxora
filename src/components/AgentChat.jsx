import React, { useEffect } from 'react'
import useAgent from '../hooks/useAgent'
import SessionSidebar from './SessionSidebar'
import ChatWindow from './ChatWindow'
import ChatInput from './ChatInput'

export default function AgentChat({ projectId }) {
  const agent = useAgent(projectId)
  const { loadSessions } = agent

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden rounded-md border bg-card">
      <SessionSidebar
        sessions={agent.sessions}
        currentSessionId={agent.currentSessionId}
        onLoadSession={agent.loadSession}
        onNewChat={agent.startNewChat}
        onDelete={agent.deleteSession}
        onRefresh={agent.loadSessions}
      />

      <div className="flex flex-1 flex-col">
        <ChatWindow
          messages={agent.messages}
          isLoading={agent.isLoading}
          error={agent.error ? agent.error.message || String(agent.error) : null}
          onRetry={agent.retryLast}
          projectId={projectId}
          sessionId={agent.currentSessionId}
        />
        <ChatInput
          onSend={agent.sendMessage}
          disabled={agent.isLoading}
          isStreaming={agent.isStreaming}
          onStop={agent.stopStreaming}
        />
      </div>
    </div>
  )
}
