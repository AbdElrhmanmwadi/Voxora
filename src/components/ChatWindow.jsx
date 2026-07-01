import React, { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages = [], isLoading, error, onRetry, projectId, sessionId }) {
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
    <div className="flex-1 overflow-y-auto bg-background p-4" ref={ref} onScroll={handleScroll}>
      {error && error !== dismissedError && (
        <div className="mb-3 flex items-start justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive">
          <span>{error}</span>
          <button
            onClick={() => setDismissedError(error)}
            aria-label="Dismiss error"
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
          <div className="font-medium text-foreground">Ask anything about this project</div>
          <div className="max-w-sm text-sm text-muted-foreground">The agent answers from the project&apos;s indexed knowledge. Pick a previous chat or just start typing below.</div>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((m, idx) => {
          // The user turn just before an assistant answer is the question we rate.
          const prev = messages[idx - 1]
          const question = prev && prev.role === 'user' ? prev.content : ''
          return (
            <MessageBubble
              key={idx}
              message={m}
              onRetry={idx === messages.length - 1 ? onRetry : undefined}
              projectId={projectId}
              sessionId={sessionId}
              question={question}
            />
          )
        })}
        {isLoading && !streamingNow && (
          <div className="text-sm text-muted-foreground">{messages.length === 0 ? 'Loading conversation…' : 'Assistant is typing…'}</div>
        )}
      </div>
    </div>
  )
}
