import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProjectsPage() {
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const nav = useNavigate()

  useEffect(() => {
    const r = localStorage.getItem('rag_recent_projects')
    if (r) setRecent(JSON.parse(r))
  }, [])

  function open() {
    setError(null)
    if (!/^[0-9]+$/.test(projectId)) return setError('Project ID must be numeric')
    const id = projectId
    const updated = [id, ...recent.filter((r) => r !== id)].slice(0, 10)
    localStorage.setItem('rag_recent_projects', JSON.stringify(updated))
    nav(`/projects/${id}`)
  }

  return (
    <div className="page-container">
      <h1 className="text-3xl font-mono font-bold neon-text-blue mb-2">RAG Knowledge Engine</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">A RAG knowledge engine UI — upload, index, and ask your data.</p>
      <div className="mb-4">
        <label className="block mb-1">Project ID</label>
        <input value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input-dark input-focus-blue" />
        {error && <div className="text-red-600 mt-2">{error}</div>}
        <div className="mt-3">
          <button onClick={open} className="btn-neon-blue">Open Project</button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Recent Projects</h2>
        <ul>
          {recent.length === 0 && <li className="text-[hsl(var(--muted-foreground))]">No recent projects</li>}
          {recent.map((r) => (
            <li key={r} className="mb-2">
              <button onClick={() => nav(`/projects/${r}`)} className="glass p-3 block hover:scale-105 transition-transform neon-border-blue">{r}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
