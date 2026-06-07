import React, { useEffect } from 'react'
import useAgent from '../hooks/useAgent'
import SessionSidebar from './SessionSidebar'
import ChatWindow from './ChatWindow'
import ChatInput from './ChatInput'

export default function AgentChat({ projectId }) {
  const agent = useAgent(projectId)

  useEffect(() => {
    agent.loadSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  return (
    <div className="flex h-full min-h-screen bg-[#0f0f0f] text-white font-inter">
      <SessionSidebar
        sessions={agent.sessions}
        currentSessionId={agent.currentSessionId}
        onLoadSession={agent.loadSession}
        onNewChat={agent.startNewChat}
        onDelete={agent.deleteSession}
        onRefresh={agent.loadSessions}
      />

      <div className="flex-1 flex flex-col">
        <ChatWindow messages={agent.messages} isLoading={agent.isLoading} />
        <ChatInput onSend={agent.sendMessage} disabled={agent.isLoading} />
      </div>
    </div>
  )
}
