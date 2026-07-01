import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import FeedbackButtons from '../features/feedback/components/FeedbackButtons'

// Backend sends each source as { text, score, metadata }, where metadata may hold
// question/section/source/page. Older shapes (file_name/preview/chunk) kept as fallbacks.
function sourceTitle(src, index) {
  const meta = src.metadata || {}
  const raw =
    meta.question || meta.section || meta.title || meta.source ||
    src.file_name || src.name
  if (!raw) return `Source ${index + 1}`
  // If it's a path, show just the file name.
  const base = String(raw).split(/[\\/]/).pop()
  return base || `Source ${index + 1}`
}

function sourcePreview(src) {
  const text = src.text || src.preview || src.chunk || ''
  return text.length > 240 ? text.slice(0, 240).trimEnd() + '…' : text
}

function SourceItem({ src, index }) {
  const page = src.metadata && src.metadata.page
  const hasScore = typeof src.score === 'number'
  return (
    <div className="mb-2 rounded-md border bg-background p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-xs font-medium text-foreground">
          {sourceTitle(src, index)}
          {page != null && <span className="text-muted-foreground"> · p.{page}</span>}
        </div>
        {hasScore && (
          <span className="shrink-0 text-xs text-muted-foreground">{src.score.toFixed(3)}</span>
        )}
      </div>
      <div className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{sourcePreview(src)}</div>
    </div>
  )
}

export default function MessageBubble({ message, onRetry, projectId, sessionId, question }) {
  const isUser = message.role === 'user'
  const [showSources, setShowSources] = useState(false)
  const [showTrace, setShowTrace] = useState(false)

  // Live replies put these on the message; reopened sessions nest them under metadata.
  const sources = message.sources || (message.metadata && message.metadata.sources) || []
  const trace = message.tool_trace || (message.metadata && message.metadata.tool_trace) || []
  const failed = !isUser && message.failed
  // Only completed assistant answers (not streaming, not failed) can be rated.
  const canRate = !isUser && !message.streaming && !failed && Boolean(message.content)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isUser ? 'bg-primary text-primary-foreground' : `bg-muted text-foreground border ${failed ? 'border-destructive/40' : 'border-border'}`} max-w-[75%] animate-fade-in rounded-lg p-3 shadow-sm`}>
        {/* dir="auto" lets Arabic answers flow RTL while keeping English LTR */}
        <div className="break-words" dir="auto">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown>{message.content || ''}</ReactMarkdown>
          )}
          {!isUser && message.streaming && (
            <span className="inline-block animate-pulse select-none" aria-hidden="true">▍</span>
          )}
        </div>

        {failed && (
          <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <span>{message.error || 'Failed to get an answer'}</span>
            {onRetry && (
              <button onClick={onRetry} className="underline underline-offset-2 hover:opacity-80">Retry</button>
            )}
          </div>
        )}

        {!isUser && (sources.length > 0 || trace.length > 0) && (
          <div className="mt-2 space-x-2 text-xs text-muted-foreground">
            {sources.length > 0 && (
              <button onClick={() => setShowSources((s) => !s)} className="underline">
                {showSources ? 'Hide Sources' : `Sources (${sources.length})`}
              </button>
            )}
            {trace.length > 0 && (
              <button onClick={() => setShowTrace((s) => !s)} className="underline">
                {showTrace ? 'Hide Trace' : `Trace (${trace.length})`}
              </button>
            )}
          </div>
        )}

        {!isUser && showSources && (
          <div className="mt-2">
            {sources.map((s, i) => <SourceItem key={i} src={s} index={i} />)}
          </div>
        )}

        {!isUser && showTrace && (
          <div className="mt-2 text-xs text-muted-foreground">
            {trace.map((t, i) => (
              <div key={i} className="mb-2 rounded-md border bg-background p-2">
                <div className="font-semibold">{t.name || t.signal || t.step || `step ${i + 1}`}</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(t, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}

        {canRate && (
          <FeedbackButtons
            projectId={projectId}
            question={question || ''}
            answer={message.content}
            sessionId={sessionId}
          />
        )}
      </div>
    </div>
  )
}
