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
    <aside className="w-72 border-r border-[#2a2a2a] bg-[#111111] p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Chats</h3>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="text-xs text-gray-400 hover:text-white">Refresh</button>
          <button onClick={onNewChat} className="bg-[#2563eb] px-2 py-1 text-xs rounded">New</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {sessions.length === 0 && <div className="text-sm text-gray-400">No sessions yet</div>}
        {sessions.map((s, idx) => {
          const id = sessionId(s)
          const confirming = id != null && String(confirmId) === String(id)
          const time = relativeTime(s)
          return (
            <div
              key={id ?? idx}
              onClick={() => id != null && onLoadSession && onLoadSession(id)}
              className={`group p-2 rounded cursor-pointer flex items-center justify-between gap-2 ${id != null && String(id) === String(currentSessionId ?? '') ? 'bg-[#1f2937]' : 'hover:bg-[#0f1724]'}`}>
              <div className="min-w-0">
                <div className="text-sm truncate" dir="auto">{sessionTitle(s)}</div>
                {time && <div className="text-[11px] text-gray-500">{time}</div>}
              </div>
              {confirming ? (
                <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setConfirmId(null); if (onDelete) onDelete(id) }}
                    className="text-xs text-red-400 hover:text-red-300">
                    Delete?
                  </button>
                  <button onClick={() => setConfirmId(null)} className="text-xs text-gray-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="shrink-0 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (id != null) setConfirmId(id) }}
                    className="text-xs text-red-400 hover:text-red-600">
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
