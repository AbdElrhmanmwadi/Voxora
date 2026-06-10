import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages = [], isLoading, error }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [messages, isLoading])

  return (
    <div className="flex-1 p-4 overflow-y-auto" ref={ref} style={{ background: '#0f0f0f' }}>
      {error && (
        <div className="mb-3 rounded border border-red-900 bg-red-950/40 p-2 text-sm text-red-300">{error}</div>
      )}
      {messages.length === 0 && (
        <div className="text-gray-400 italic">Start a new chat or select a session.</div>
      )}

      <div className="space-y-3">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} message={m} />
        ))}
        {isLoading && (
          <div className="text-sm text-gray-400">Assistant is typing…</div>
        )}
      </div>
    </div>
  )
}
