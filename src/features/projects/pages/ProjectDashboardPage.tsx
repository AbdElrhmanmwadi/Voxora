import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Badge from '../../../core/ui/Badge'
import Button from '../../../core/ui/Button'
import { useFilesStore } from '../../files/store/useFilesStore'
import { rememberProject } from '../recentProjects'

const tools = [
  { path: 'files', title: 'Files', description: 'Upload source assets, process chunks, and push indexes.', requiresFiles: false },
  { path: 'ask', title: 'Ask AI', description: 'One-shot: search indexed content and get a single grounded answer.', requiresFiles: true },
  { path: 'agent', title: 'Agent Chat', description: 'Multi-turn: hold a conversation with the project-scoped agent.', requiresFiles: true },
  { path: 'translate', title: 'Translation', description: 'Create translation jobs and track output files.', requiresFiles: true },
  { path: 'voice', title: 'Voice', description: 'Ask by speaking and hear the answer back.', requiresFiles: true }
]

export default function ProjectDashboardPage() {
  const { projectId } = useParams()
  const nav = useNavigate()
  const {
    files,
    selectedFileIds,
    isLoadingFiles,
    loadFiles,
    toggleFileSelection
  } = useFilesStore()
  const activeProjectId = projectId ?? ''
  // Query tools need retrievable content — i.e. at least one processed file.
  const hasIndexedFiles = files.some((file) => file.processed)

  useEffect(() => {
    if (activeProjectId) {
      // Keep the recent-projects list accurate for direct/URL visits too.
      rememberProject(activeProjectId)
      void loadFiles(activeProjectId)
    }
  }, [activeProjectId, loadFiles])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Project overview</p>
          <h1 className="page-title">Project {activeProjectId}</h1>
          <p className="page-description">Select project files, then run Ask, Voice, or Translate against that scoped context.</p>
        </div>
        <Badge variant="outline">ID {activeProjectId}</Badge>
      </div>

      {!isLoadingFiles && files.length === 0 && (
        <div className="flex flex-col gap-3 rounded-md border border-dashed bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">This project has no files yet</p>
            <p className="text-sm text-muted-foreground">Upload and index files to unlock Ask, Agent, Translate, and Voice.</p>
          </div>
          <Button onClick={() => nav('files')} className="shrink-0">Upload files</Button>
        </div>
      )}

      {!isLoadingFiles && files.length > 0 && !hasIndexedFiles && (
        <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Files are uploaded but not indexed yet</p>
            <p className="text-sm">Process and push the index so Ask, Agent, Translate, and Voice have content to retrieve.</p>
          </div>
          <Button onClick={() => nav('files')} className="shrink-0">Process &amp; index</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => {
          const locked = tool.requiresFiles && !hasIndexedFiles
          if (locked) {
            const reason = files.length === 0 ? 'Upload files first' : 'Process & index files first'
            return (
              <Card
                key={tool.path}
                aria-disabled="true"
                title={`${reason} to use this tool`}
                className="opacity-60"
              >
                <CardHeader>
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-muted-foreground">{reason}</span>
                </CardContent>
              </Card>
            )
          }
          return (
            <Card
              key={tool.path}
              role="button"
              tabIndex={0}
              className="cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => nav(tool.path)}
              onKeyDown={(event) => event.key === 'Enter' && nav(tool.path)}
            >
              <CardHeader>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium">Open workflow</span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Project files</CardTitle>
              <CardDescription>Metadata only. Services use selected file IDs as their context boundary.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{files.length} files</Badge>
              <Badge variant={selectedFileIds.length > 0 ? 'success' : 'warning'}>{selectedFileIds.length} selected</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingFiles && <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Loading project files...</div>}
          {!isLoadingFiles && files.length === 0 && (
            <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No files found for this project.
            </div>
          )}
          <ul className="space-y-2">
            {files.map((file) => {
              const checked = selectedFileIds.includes(file.file_id)
              return (
                <li key={file.file_id} className="flex flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex min-w-0 cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFileSelection(activeProjectId, file.file_id)}
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="block truncate text-sm font-medium">{file.file_name}</span>
                        {file.processed ? (
                          <Badge variant="success">Indexed</Badge>
                        ) : (
                          <Badge variant="warning">Not indexed</Badge>
                        )}
                      </span>
                      <code className="mt-1 block break-all font-mono text-xs text-muted-foreground">{file.file_id}</code>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <div className="mt-4">
            <Button variant="outline" onClick={() => nav('files')}>Manage files</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
