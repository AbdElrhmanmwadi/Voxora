import React, { useState } from 'react'
import { sessionId } from '../hooks/useAgent'

function sessionTitle(s) {
  return s.title || s.name || s.first_message || 'Untitled'
}

// Compact "how long ago" label from the session's last activity.
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
  // Two-step delete: first click arms the confirmation, second click deletes.
  const [confirmId, setConfirmId] = useState(null)

  return (
    <aside className="flex w-72 flex-col border-r bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Chats</h3>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="text-xs text-muted-foreground hover:text-foreground">Refresh</button>
          <button onClick={onNewChat} className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">New</button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-auto">
        {sessions.length === 0 && <div className="text-sm text-muted-foreground">No sessions yet</div>}
        {sessions.map((s, idx) => {
          const id = sessionId(s)
          const confirming = id != null && String(confirmId) === String(id)
          const time = relativeTime(s)
          return (
            <div
              key={id ?? idx}
              onClick={() => id != null && onLoadSession && onLoadSession(id)}
              className={`group flex cursor-pointer items-center justify-between gap-2 rounded-md p-2 ${id != null && String(id) === String(currentSessionId ?? '') ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}>
              <div className="min-w-0">
                <div className="truncate text-sm" dir="auto">{sessionTitle(s)}</div>
                {time && <div className="text-[11px] text-muted-foreground">{time}</div>}
              </div>
              {confirming ? (
                <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setConfirmId(null); if (onDelete) onDelete(id) }}
                    className="text-xs text-destructive hover:opacity-80">
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
