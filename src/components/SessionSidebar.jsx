import React from 'react'

export default function SessionSidebar({ sessions = [], currentSessionId, onLoadSession, onNewChat, onDelete, onRefresh }) {
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
        {sessions.map((s) => (
          <div
            key={s.session_id}
            onClick={() => onLoadSession && onLoadSession(s.session_id)}
            className={`p-2 rounded cursor-pointer flex items-center justify-between ${s.session_id === currentSessionId ? 'bg-[#1f2937]' : 'hover:bg-[#0f1724]'}`}>
            <div className="text-sm truncate">{s.title || 'Untitled'}</div>
            <div className="opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete && onDelete(s.session_id) }}
                className="text-xs text-red-400 hover:text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
