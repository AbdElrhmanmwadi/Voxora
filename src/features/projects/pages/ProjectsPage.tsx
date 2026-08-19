import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../../core/ui/Input'
import Button from '../../../core/ui/Button'
import FormField from '../../../core/ui/FormField'
import EmptyState from '../../../core/ui/EmptyState'
import { useI18n } from '../../../core/i18n'
import {
  forgetProject,
  listRecentProjects,
  rememberProject,
  type RecentProject
} from '../recentProjects'

function relativeTime(ts: number, t: (key: string, params?: Record<string, string | number>) => string) {
  const diff = Date.now() - ts
  const mins = Math.round(diff / 60000)
  if (mins < 1) return t('projects.time.justNow')
  if (mins < 60) return t('projects.time.minutesAgo', { count: mins })
  const hours = Math.round(mins / 60)
  if (hours < 24) return t('projects.time.hoursAgo', { count: hours })
  const days = Math.round(hours / 24)
  return t('projects.time.daysAgo', { count: days })
}

export default function ProjectsPage() {
  const [projectId, setProjectId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<RecentProject[]>([])
  const nav = useNavigate()
  const { t } = useI18n()

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
    if (!/^[0-9]+$/.test(id)) return setError(t('projects.open.errorNumeric'))
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
          <p className="page-kicker">{t('projects.page.kicker')}</p>
          <h1 className="page-title">{t('projects.page.title')}</h1>
          <p className="page-description">{t('projects.page.description')}</p>
        </div>
      </div>

      <div className="rounded-md border bg-card p-6">
        <h2 className="text-sm font-bold font-display tracking-tight">{t('projects.open.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('projects.open.description')}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-start">
          <FormField label={t('projects.open.projectId')} error={error}>
            {(field) => (
              <Input
                {...field}
                inputMode="numeric"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder={t('projects.open.projectIdPlaceholder')}
              />
            )}
          </FormField>
          <FormField label={t('projects.open.name')}>
            {(field) => (
              <Input
                {...field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder={t('projects.open.namePlaceholder')}
              />
            )}
          </FormField>
          <Button onClick={submit} className="w-full sm:mt-7 sm:w-auto">{t('projects.open.submit')}</Button>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground font-display">{t('projects.recent.title')}</h2>
          {projects.length > 0 && <span className="text-xs text-muted-foreground">{t('projects.recent.saved', { count: projects.length })}</span>}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title={t('projects.recent.empty')}
            description={t('projects.recent.emptyDescription')}
            className="p-10"
          />
        ) : (
          <div className="divide-y rounded-md border bg-card">
            {projects.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => open(p.id)}
                onKeyDown={(e) => e.key === 'Enter' && open(p.id)}
                className="group flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t('projects.recent.id', { id: p.id })} · {t('projects.recent.opened', { time: relativeTime(p.lastOpenedAt, t) })}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => remove(e, p.id)}
                  aria-label={t('projects.recent.remove', { name: p.name })}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
