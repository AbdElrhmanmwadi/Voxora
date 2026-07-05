import React, { useState, useRef, useEffect } from 'react'
import VoiceRecordButton from '../features/voice/components/VoiceRecordButton'

// Backend rejects messages over 8000 chars (422), so cap client-side.
const MAX_LEN = 8000

export default function ChatInput({ onSend, disabled, isStreaming, onStop }) {
  const [text, setText] = useState('')
  const [voiceError, setVoiceError] = useState(null)
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

  const sendVoiceTranscript = async (transcript) => {
    const payload = transcript.trim()
    if (!payload || !canSend) return
    setText('')
    setVoiceError(null)
    await onSend(payload)
  }

  return (
    <div className="border-t bg-card p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the agent..."
          dir="auto"
          maxLength={MAX_LEN}
          className="flex-1 resize-none overflow-y-auto rounded-md border border-input bg-background p-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows={1}
        />

        {isStreaming ? (
          <button onClick={onStop} className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90">
            Stop
          </button>
        ) : (
          <>
            <VoiceRecordButton
              disabled={!canSend}
              onTranscript={sendVoiceTranscript}
              onError={setVoiceError}
              className="h-[38px]"
            />
            <button
              onClick={submit}
              disabled={!canSend || !text.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </>
        )}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>Enter to send · Shift+Enter for a new line</span>
        {nearLimit && (
          <span className={text.length >= MAX_LEN ? 'text-destructive' : ''}>
            {text.length}/{MAX_LEN}
          </span>
        )}
      </div>
      {voiceError && (
        <div role="alert" className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
          {voiceError}
        </div>
      )}
    </div>
  )
}
