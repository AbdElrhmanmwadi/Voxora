import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'
import Badge from '../../../core/ui/Badge'

export default function ProjectsPage() {
  const [projectId, setProjectId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const nav = useNavigate()

  useEffect(() => {
    try {
      const r = localStorage.getItem('rag_recent_projects')
      if (!r) return
      const parsed = JSON.parse(r)
      if (Array.isArray(parsed)) setRecent(parsed.filter((item): item is string => typeof item === 'string'))
    } catch {
      // Corrupt localStorage entry; start with an empty list.
    }
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
      <div className="page-header">
        <div>
          <p className="page-kicker">Workspace</p>
          <h1 className="page-title">Open a knowledge project</h1>
          <p className="page-description">Jump into project files, retrieval, translation, and voice workflows from a single operational workspace.</p>
        </div>
        <Badge variant="secondary">Local session</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Project access</CardTitle>
            <CardDescription>Enter a numeric project ID to load its dashboard without changing existing API behavior.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="space-y-2">
                <label className="field-label" htmlFor="project-id">Project ID</label>
                <Input
                  id="project-id"
                  inputMode="numeric"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && open()}
                  placeholder="e.g. 1024"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'project-error' : undefined}
                />
                {error && <p id="project-error" className="text-sm font-medium text-destructive">{error}</p>}
              </div>
              <Button onClick={open} className="w-full sm:w-auto">Open project</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent projects</CardTitle>
            <CardDescription>Stored in this browser for quick access.</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">No recent projects yet.</div>
            ) : (
              <ul className="space-y-2">
                {recent.map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => nav(`/projects/${r}`)}
                      className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-3 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="font-medium">Project {r}</span>
                      <span className="text-xs text-muted-foreground">Open</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
