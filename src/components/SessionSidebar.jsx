import React, { useState } from 'react'
import { sessionId } from '../hooks/useAgent'

function sessionTitle(s) {
  return s.title || s.name || s.first_message || 'Untitled'
}

function relativeTime(s) {
  const iso = s.updated_at || s.created_at
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (sec < 60) return 'now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`
  return `${Math.floor(sec / 86400)}d`
}

export default function SessionSidebar({ sessions = [], currentSessionId, onLoadSession, onNewChat, onDelete, onRefresh }) {
  const [confirmId, setConfirmId] = useState(null)

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground font-display">Chats</h3>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="text-xs text-muted-foreground transition-colors hover:text-foreground">Refresh</button>
          <button onClick={onNewChat} className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">New</button>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-auto p-2">
        {sessions.length === 0 && <div className="px-2 py-4 text-center text-sm text-muted-foreground">No sessions yet</div>}
        {sessions.map((s, idx) => {
          const id = sessionId(s)
          const confirming = id != null && String(confirmId) === String(id)
          const time = relativeTime(s)
          const isActive = id != null && String(id) === String(currentSessionId ?? '')
          return (
            <div
              key={id ?? idx}
              onClick={() => id != null && onLoadSession && onLoadSession(id)}
              className={`group flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
              }`}>
              <div className="min-w-0">
                <div className={`truncate text-sm ${isActive ? 'font-semibold' : ''}`} dir="auto">{sessionTitle(s)}</div>
                {time && <div className="text-[11px] text-muted-foreground">{time}</div>}
              </div>
              {confirming ? (
                <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setConfirmId(null); if (onDelete) onDelete(id) }}
                    className="text-xs font-semibold text-destructive hover:opacity-80">
                    Delete?
                  </button>
                  <button onClick={() => setConfirmId(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="shrink-0 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (id != null) setConfirmId(id) }}
                    className="text-xs text-destructive hover:opacity-80">
                    Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
