import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import FeedbackButtons from '../features/feedback/components/FeedbackButtons'
import { useI18n } from '../core/i18n'

function sourceTitle(src, index) {
  const meta = src.metadata || {}
  const raw =
    meta.question || meta.section || meta.title || meta.source ||
    src.file_name || src.name
  if (!raw) return `Source ${index + 1}`
  const base = String(raw).split(/[\\/]/).pop()
  return base || `Source ${index + 1}`
}

function sourcePreview(src) {
  const text = src.text || src.preview || src.chunk || ''
  return text.length > 240 ? text.slice(0, 240).trimEnd() + '...' : text
}

function SourceItem({ src, index }) {
  const page = src.metadata && src.metadata.page
  const hasScore = typeof src.score === 'number'
  return (
    <div className="mb-2 rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-xs font-semibold text-foreground font-display">
          {sourceTitle(src, index)}
          {page != null && <span className="text-muted-foreground font-normal"> p.{page}</span>}
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
  const { t } = useI18n()

  const sources = message.sources || (message.metadata && message.metadata.sources) || []
  const trace = message.tool_trace || (message.metadata && message.metadata.tool_trace) || []
  const failed = !isUser && message.failed
  const canRate = !isUser && !message.streaming && !failed && Boolean(message.content)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] animate-fade-in rounded-md p-3 ${
        isUser
          ? 'bg-primary text-primary-foreground'
          : `border bg-background ${failed ? 'border-destructive/40' : 'border-border'}`
      }`}>
        <div className="break-words" dir="auto">
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
          ) : (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed">
              <ReactMarkdown>{message.content || ''}</ReactMarkdown>
            </div>
          )}
          {!isUser && message.streaming && (
            <span className="inline-block animate-pulse select-none text-primary" aria-hidden="true">|</span>
          )}
        </div>

        {failed && (
          <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
            <span>{message.error || t('agent.message.failed')}</span>
            {onRetry && (
              <button onClick={onRetry} className="font-semibold underline underline-offset-2 hover:opacity-80">{t('agent.message.retry')}</button>
            )}
          </div>
        )}

        {!isUser && (sources.length > 0 || trace.length > 0) && (
          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
            {sources.length > 0 && (
              <button onClick={() => setShowSources((s) => !s)} className="font-semibold underline underline-offset-2">
                {showSources ? t('agent.message.hideSources') : t('agent.message.sources', { count: sources.length })}
              </button>
            )}
            {trace.length > 0 && (
              <button onClick={() => setShowTrace((s) => !s)} className="font-semibold underline underline-offset-2">
                {showTrace ? t('agent.message.hideTrace') : t('agent.message.trace', { count: trace.length })}
              </button>
            )}
          </div>
        )}

        {!isUser && showSources && (
          <div className="mt-3">
            {sources.map((s, i) => <SourceItem key={i} src={s} index={i} />)}
          </div>
        )}

        {!isUser && showTrace && (
          <div className="mt-3 text-xs text-muted-foreground">
            {trace.map((t_, i) => (
              <div key={i} className="mb-2 rounded-md border bg-background p-2">
                <div className="font-bold font-display">{t_.name || t_.signal || t_.step || `step ${i + 1}`}</div>
                <pre className="mt-1 whitespace-pre-wrap text-xs">{JSON.stringify(t_, null, 2)}</pre>
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
