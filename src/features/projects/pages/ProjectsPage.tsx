import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../core/ui/Card'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'

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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Voxora AI — Workspace</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Access projects, chat, translation, and voice tools.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Project ID</label>
            <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Enter numeric project id" />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="pt-2">
              <Button onClick={open}>Open Project</Button>
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <h3 className="text-base font-medium mb-2">Recent Projects</h3>
            <ul className="space-y-2">
              {recent.length === 0 && <li className="text-[hsl(var(--muted-foreground))]">No recent projects</li>}
              {recent.map((r) => (
                <li key={r}>
                  <button onClick={() => nav(`/projects/${r}`)} className="w-full text-left glass p-3 hover:scale-105 transition-transform">{r}</button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
