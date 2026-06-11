import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages = [], isLoading, error, onRetry }) {
  const ref = useRef(null)
  // Follow the bottom while new tokens stream in, but stop as soon as the
  // user scrolls up to read; resume when they scroll back down.
  const stickToBottomRef = useRef(true)

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  useEffect(() => {
    const el = ref.current
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, isLoading])

  const last = messages[messages.length - 1]
  const streamingNow = Boolean(last && last.role === 'assistant' && last.streaming)

  return (
    <div className="flex-1 p-4 overflow-y-auto" ref={ref} onScroll={handleScroll} style={{ background: '#0f0f0f' }}>
      {error && (
        <div className="mb-3 rounded border border-red-900 bg-red-950/40 p-2 text-sm text-red-300">{error}</div>
      )}
      {messages.length === 0 && (
        <div className="text-gray-400 italic">Start a new chat or select a session.</div>
      )}

      <div className="space-y-3">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} message={m} onRetry={idx === messages.length - 1 ? onRetry : undefined} />
        ))}
        {isLoading && !streamingNow && (
          <div className="text-sm text-gray-400">Assistant is typing…</div>
        )}
      </div>
    </div>
  )
}
