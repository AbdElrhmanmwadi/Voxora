import React, { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages = [], isLoading, error, onRetry }) {
  const ref = useRef(null)
  // Follow the bottom while new tokens stream in, but stop as soon as the
  // user scrolls up to read; resume when they scroll back down.
  const stickToBottomRef = useRef(true)
  const prevLenRef = useRef(0)
  const [dismissedError, setDismissedError] = useState(null)

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  useEffect(() => {
    // Sending a message is an explicit "jump to the conversation end",
    // even if the user had scrolled up.
    if (messages.length > prevLenRef.current) {
      const appended = messages.slice(prevLenRef.current)
      if (appended.some((m) => m.role === 'user')) stickToBottomRef.current = true
    }
    prevLenRef.current = messages.length

    const el = ref.current
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight
  }, [messages, isLoading])

  const last = messages[messages.length - 1]
  const streamingNow = Boolean(last && last.role === 'assistant' && last.streaming)

  return (
    <div className="flex-1 p-4 overflow-y-auto" ref={ref} onScroll={handleScroll} style={{ background: '#0f0f0f' }}>
      {error && error !== dismissedError && (
        <div className="mb-3 flex items-start justify-between gap-3 rounded border border-red-900 bg-red-950/40 p-2 text-sm text-red-300">
          <span>{error}</span>
          <button
            onClick={() => setDismissedError(error)}
            aria-label="Dismiss error"
            className="shrink-0 text-red-400 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
          <div className="text-gray-300">Ask anything about this project</div>
          <div className="text-sm text-gray-500">The agent answers from the project&apos;s indexed knowledge. Pick a previous chat or just start typing below.</div>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} message={m} onRetry={idx === messages.length - 1 ? onRetry : undefined} />
        ))}
        {isLoading && !streamingNow && (
          <div className="text-sm text-gray-400">{messages.length === 0 ? 'Loading conversation…' : 'Assistant is typing…'}</div>
        )}
      </div>
    </div>
  )
}
