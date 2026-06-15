import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'
import Badge from '../../../core/ui/Badge'
import FormField from '../../../core/ui/FormField'
import EmptyState from '../../../core/ui/EmptyState'
import {
  forgetProject,
  listRecentProjects,
  rememberProject,
  type RecentProject
} from '../recentProjects'

function relativeTime(ts: number) {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.round(hours / 24)
  return `${days} d ago`
}

export default function ProjectsPage() {
  const [projectId, setProjectId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<RecentProject[]>([])
  const nav = useNavigate()

  useEffect(() => {
    setProjects(listRecentProjects())
  }, [])

  function open(id: string, friendlyName?: string) {
    rememberProject(id, friendlyName)
    nav(`/projects/${id}`)
  }

  function submit() {
    setError(null)
    const id = projectId.trim()
    if (!/^[0-9]+$/.test(id)) return setError('Project ID must be numeric')
    open(id, name)
  }

  function remove(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setProjects(forgetProject(id))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Workspace</p>
          <h1 className="page-title">Your projects</h1>
          <p className="page-description">Open a project to manage its files, retrieval, translation, and voice workflows.</p>
        </div>
        <Badge variant="secondary">Local session</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open a project</CardTitle>
          <CardDescription>Enter a project ID to open it. Add a name to recognize it later — names are saved in this browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-start">
            <FormField label="Project ID" error={error}>
              {(field) => (
                <Input
                  {...field}
                  inputMode="numeric"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="e.g. 1024"
                />
              )}
            </FormField>
            <FormField label="Name (optional)">
              {(field) => (
                <Input
                  {...field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="e.g. Q3 Research"
                />
              )}
            </FormField>
            <Button onClick={submit} className="w-full sm:mt-7 sm:w-auto">Open project</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent projects</h2>
          {projects.length > 0 && <span className="text-xs text-muted-foreground">{projects.length} saved in this browser</span>}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Open one by ID above to get started — it will appear here for quick access."
            className="p-8"
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => open(p.id)}
                  onKeyDown={(e) => e.key === 'Enter' && open(p.id)}
                  className="group cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CardContent className="flex items-start justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">ID {p.id} · opened {relativeTime(p.lastOpenedAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => remove(e, p.id)}
                      aria-label={`Remove ${p.name} from recent projects`}
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                    >
                      &times;
                    </button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
