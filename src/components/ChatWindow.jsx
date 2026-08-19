import React, { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import { useI18n } from '../core/i18n'

export default function ChatWindow({ messages = [], isLoading, error, onRetry, projectId, sessionId }) {
  const ref = useRef(null)
  const stickToBottomRef = useRef(true)
  const prevLenRef = useRef(0)
  const [dismissedError, setDismissedError] = useState(null)
  const { t } = useI18n()

  const handleScroll = () => {
    const el = ref.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  useEffect(() => {
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
            aria-label={t('agent.window.dismissError')}
            className="shrink-0 opacity-70 hover:opacity-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
            </svg>
          </div>
          <div className="text-sm font-bold font-display">{t('agent.window.empty')}</div>
          <div className="max-w-sm text-sm text-muted-foreground">{t('agent.window.emptyDescription')}</div>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((m, idx) => {
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
          <div className="text-sm text-muted-foreground">{messages.length === 0 ? t('agent.window.loading') : t('agent.window.typing')}</div>
        )}
      </div>
    </div>
  )
}
