import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

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
    <div className="p-2 border border-[#2a2a2a] rounded mb-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-gray-300 truncate">
          {sourceTitle(src, index)}
          {page != null && <span className="text-gray-500"> · p.{page}</span>}
        </div>
        {hasScore && (
          <span className="text-xs text-gray-500 shrink-0">{src.score.toFixed(3)}</span>
        )}
      </div>
      <div className="text-sm text-gray-200 whitespace-pre-wrap break-words mt-1">{sourcePreview(src)}</div>
    </div>
  )
}

export default function MessageBubble({ message, onRetry }) {
  const isUser = message.role === 'user'
  const [showSources, setShowSources] = useState(false)
  const [showTrace, setShowTrace] = useState(false)

  // Live replies put these on the message; reopened sessions nest them under metadata.
  const sources = message.sources || (message.metadata && message.metadata.sources) || []
  const trace = message.tool_trace || (message.metadata && message.metadata.tool_trace) || []
  const failed = !isUser && message.failed

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isUser ? 'bg-[#2563eb] text-white' : `bg-[#1a1a1a] text-gray-200 border ${failed ? 'border-red-900' : 'border-[#2a2a2a]'}`} max-w-[75%] p-3 rounded-lg shadow-sm animate-fade-in`}>
        {/* dir="auto" lets Arabic answers flow RTL while keeping English LTR */}
        <div className="prose prose-invert break-words" dir="auto">
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
          <div className="mt-2 flex items-center gap-2 text-xs text-red-300">
            <span>{message.error || 'Failed to get an answer'}</span>
            {onRetry && (
              <button onClick={onRetry} className="underline hover:text-red-200">Retry</button>
            )}
          </div>
        )}

        {!isUser && (
          <div className="mt-2 space-x-2 text-xs text-gray-400">
            <button onClick={() => setShowSources((s) => !s)} className="underline">{showSources ? 'Hide Sources' : 'Show Sources'}</button>
            <button onClick={() => setShowTrace((s) => !s)} className="underline">{showTrace ? 'Hide Trace' : 'Show Trace'}</button>
          </div>
        )}

        {!isUser && showSources && (
          <div className="mt-2">
            {sources.length === 0 && <div className="text-xs text-gray-500">No sources</div>}
            {sources.map((s, i) => <SourceItem key={i} src={s} index={i} />)}
          </div>
        )}

        {!isUser && showTrace && (
          <div className="mt-2 text-xs text-gray-400">
            {trace.length === 0 && <div>No trace</div>}
            {trace.map((t, i) => (
              <div key={i} className="p-2 border border-[#2a2a2a] rounded mb-2">
                <div className="font-semibold">{t.name || t.signal || t.step || `step ${i + 1}`}</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(t, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
