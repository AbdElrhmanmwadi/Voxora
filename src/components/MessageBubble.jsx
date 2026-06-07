import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

function SourceItem({ src }) {
  return (
    <div className="p-2 border border-[#2a2a2a] rounded mb-2">
      <div className="text-xs text-gray-300">{src.file_name || src.name || 'source'}</div>
      <div className="text-sm text-gray-200 truncate">{src.preview || src.chunk || ''}</div>
    </div>
  )
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const [showSources, setShowSources] = useState(false)
  const [showTrace, setShowTrace] = useState(false)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isUser ? 'bg-[#2563eb] text-white' : 'bg-[#1a1a1a] text-gray-200 border border-[#2a2a2a]'} max-w-[75%] p-3 rounded-lg shadow-sm animate-fade-in`}>
        <div className="prose prose-invert break-words">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown>{message.content || ''}</ReactMarkdown>
          )}
        </div>

        {!isUser && (
          <div className="mt-2 space-x-2 text-xs text-gray-400">
            <button onClick={() => setShowSources((s) => !s)} className="underline">{showSources ? 'Hide Sources' : 'Show Sources'}</button>
            <button onClick={() => setShowTrace((s) => !s)} className="underline">{showTrace ? 'Hide Trace' : 'Show Trace'}</button>
          </div>
        )}

        {!isUser && showSources && (
          <div className="mt-2">
            {(message.sources || []).length === 0 && <div className="text-xs text-gray-500">No sources</div>}
            {(message.sources || []).map((s, i) => <SourceItem key={i} src={s} />)}
          </div>
        )}

        {!isUser && showTrace && (
          <div className="mt-2 text-xs text-gray-400">
            {(message.tool_trace || []).length === 0 && <div>No trace</div>}
            {(message.tool_trace || []).map((t, i) => (
              <div key={i} className="p-2 border border-[#2a2a2a] rounded mb-2">
                <div className="font-semibold">{t.signal || t.step || `step ${i + 1}`}</div>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(t, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
