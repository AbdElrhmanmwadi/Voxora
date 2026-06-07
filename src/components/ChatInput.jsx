import React, { useState, useRef, useEffect } from 'react'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [text])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = async () => {
    if (!text.trim() || disabled) return
    const payload = text.trim()
    setText('')
    try {
      await onSend(payload)
    } catch (e) {
      // swallow — hook sets error state
    }
  }

  return (
    <div className="p-3 border-t border-[#2a2a2a] bg-[#111111]">
      <div className="flex gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the agent..."
          className="flex-1 resize-none bg-[#1a1a1a] text-white p-2 rounded outline-none"
          rows={1}
          disabled={disabled}
        />

        <button onClick={submit} disabled={disabled} className="bg-[#2563eb] px-4 rounded text-white">
          Send
        </button>
      </div>
    </div>
  )
}
