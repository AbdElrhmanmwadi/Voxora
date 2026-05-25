import React from 'react'

export default function StatusBadge({ status }: { status: 'idle' | 'loading' | 'success' | 'error' | 'empty' }) {
  const map: Record<string, string> = {
    idle: 'bg-white/5 text-[hsl(var(--foreground))] border border-white/5',
    loading: 'bg-black/30 text-neon-blue',
    success: 'bg-black/30 text-neon-green',
    error: 'bg-black/30 text-neon-red',
    empty: 'bg-black/30 text-neon-orange'
  }
  return <span className={`px-2 py-1 rounded font-mono text-sm ${map[status]}`}>{status}</span>
}
