import React, { useState, useRef, useEffect } from 'react'

// Backend rejects messages over 8000 chars (422), so cap client-side.
const MAX_LEN = 8000

export default function ChatInput({ onSend, disabled, isStreaming, onStop }) {
  const [text, setText] = useState('')
  const taRef = useRef(null)
  // Typing stays available while an answer streams; only sending is blocked.
  const canSend = !disabled && !isStreaming

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  // Give focus back when the answer finishes so the user can keep typing.
  const prevStreamingRef = useRef(isStreaming)
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming && taRef.current) taRef.current.focus()
    prevStreamingRef.current = isStreaming
  }, [isStreaming])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = async () => {
    if (!text.trim() || !canSend) return
    const payload = text.trim()
    setText('')
    try {
      await onSend(payload)
    } catch (e) {
      // swallow — hook renders the failed bubble
    }
  }

  const nearLimit = text.length > MAX_LEN - 1000

  return (
    <div className="p-3 border-t border-[#2a2a2a] bg-[#111111]">
      <div className="flex items-end gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the agent..."
          dir="auto"
          maxLength={MAX_LEN}
          className="flex-1 resize-none overflow-y-auto bg-[#1a1a1a] text-white p-2 rounded outline-none"
          rows={1}
        />

        {isStreaming ? (
          <button onClick={onStop} className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-white">
            Stop
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canSend || !text.trim()}
            className="bg-[#2563eb] px-4 py-2 rounded text-white disabled:opacity-50"
          >
            Send
          </button>
        )}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-500">
        <span>Enter to send · Shift+Enter for a new line</span>
        {nearLimit && (
          <span className={text.length >= MAX_LEN ? 'text-red-400' : ''}>
            {text.length}/{MAX_LEN}
          </span>
        )}
      </div>
    </div>
  )
}
