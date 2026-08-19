import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Badge from '../../../core/ui/Badge'
import Button from '../../../core/ui/Button'
import { useFilesStore } from '../../files/store/useFilesStore'
import { useI18n } from '../../../core/i18n'
import { rememberProject } from '../recentProjects'

export default function ProjectDashboardPage() {
  const { projectId } = useParams()
  const nav = useNavigate()
  const { t } = useI18n()
  const {
    files,
    selectedFileIds,
    isLoadingFiles,
    loadFiles,
  } = useFilesStore()
  const activeProjectId = projectId ?? ''
  const hasIndexedFiles = files.some((file) => file.processed)

  const tools = [
    { path: 'files', title: t('dashboard.tools.files.title'), description: t('dashboard.tools.files.description'), requiresFiles: false, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' },
    { path: 'ask', title: t('dashboard.tools.ask.title'), description: t('dashboard.tools.ask.description'), requiresFiles: true, icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 5v5l3 3' },
    { path: 'agent', title: t('dashboard.tools.agent.title'), description: t('dashboard.tools.agent.description'), requiresFiles: true, icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z' },
    { path: 'translate', title: t('dashboard.tools.translate.title'), description: t('dashboard.tools.translate.description'), requiresFiles: true, icon: 'M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6' },
    { path: 'voice', title: t('dashboard.tools.voice.title'), description: t('dashboard.tools.voice.description'), requiresFiles: true, icon: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM19 10v2a7 7 0 0 1-14 0v-2M12 19v4' }
  ]

  useEffect(() => {
    if (activeProjectId) {
      rememberProject(activeProjectId)
      void loadFiles(activeProjectId)
    }
  }, [activeProjectId, loadFiles])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">{t('dashboard.page.kicker')}</p>
          <h1 className="page-title">{t('dashboard.page.title', { id: activeProjectId })}</h1>
          <p className="page-description">{t('dashboard.page.description')}</p>
        </div>
        <Badge variant="outline">ID {activeProjectId}</Badge>
      </div>

      {!isLoadingFiles && files.length === 0 && (
        <div className="flex flex-col gap-3 rounded-md border border-dashed bg-muted/20 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{t('dashboard.noFiles.title')}</p>
            <p className="text-sm text-muted-foreground">{t('dashboard.noFiles.description')}</p>
          </div>
          <Button onClick={() => nav('files')} className="shrink-0">{t('dashboard.noFiles.action')}</Button>
        </div>
      )}

      {!isLoadingFiles && files.length > 0 && !hasIndexedFiles && (
        <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{t('dashboard.notIndexed.title')}</p>
            <p className="text-sm opacity-80">{t('dashboard.notIndexed.description')}</p>
          </div>
          <Button onClick={() => nav('files')} className="shrink-0">{t('dashboard.notIndexed.action')}</Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const locked = tool.requiresFiles && !hasIndexedFiles
          if (locked) {
            const reason = files.length === 0 ? t('dashboard.tools.uploadFirst') : t('dashboard.tools.processFirst')
            return (
              <div
                key={tool.path}
                className="rounded-md border bg-card p-5 opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d={tool.icon} /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-display">{tool.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{reason}</p>
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div
              key={tool.path}
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-md border bg-card p-5 transition-all hover:border-foreground/15 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => nav(tool.path)}
              onKeyDown={(event) => event.key === 'Enter' && nav(tool.path)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d={tool.icon} /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold font-display">{tool.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
                  <p className="mt-2 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">{t('dashboard.tools.openWorkflow')}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-md border bg-card">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold font-display">{t('dashboard.filesSection.title')}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('dashboard.filesSection.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{t('dashboard.filesSection.files', { count: files.length })}</Badge>
            <Badge variant={selectedFileIds.length > 0 ? 'success' : 'warning'}>{t('dashboard.filesSection.selected', { count: selectedFileIds.length })}</Badge>
          </div>
        </div>
        <div className="p-5">
          {isLoadingFiles && <div className="rounded-md bg-muted/30 p-3 text-sm text-muted-foreground">{t('dashboard.filesSection.loading')}</div>}
          {!isLoadingFiles && files.length === 0 && (
            <div className="rounded-md border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              {t('dashboard.filesSection.empty')}
            </div>
          )}
          <div className="divide-y rounded-md border">
            {files.map((file) => {
              const checked = selectedFileIds.includes(file.file_id)
              return (
                <label key={file.file_id} className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/30">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => useFilesStore.getState().toggleFileSelection(activeProjectId, file.file_id)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{file.file_name}</span>
                      {file.processed ? (
                        <Badge variant="success">{t('dashboard.filesSection.indexed')}</Badge>
                      ) : (
                        <Badge variant="warning">{t('dashboard.filesSection.notIndexed')}</Badge>
                      )}
                    </span>
                    <code className="mt-0.5 block break-all font-mono text-[11px] text-muted-foreground">{file.file_id}</code>
                  </span>
                </label>
              )
            })}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => nav('files')}>{t('dashboard.filesSection.manage')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
