import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslationStore } from '../store/useTranslationStore'
import AppCard from '../../../core/components/AppCard'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Badge from '../../../core/ui/Badge'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import StatusBadge from '../../../core/components/StatusBadge'

export default function TranslatePage() {
  const { projectId } = useParams()
  const [fileId, setFileId] = useState('')
  const [source, setSource] = useState('en')
  const [target, setTarget] = useState('es')
  const { jobId, status, resultFileId, creating, checking, createJob, checkStatus, error } = useTranslationStore()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Translation</p>
          <h1 className="page-title">Translate project content</h1>
          <p className="page-description">Create translation jobs from uploaded files and monitor their result file IDs.</p>
        </div>
        <StatusBadge status={status ? 'success' : jobId ? 'loading' : 'idle'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AppCard title="Create job">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="field-label" htmlFor="file-id">File ID</label>
              <Input id="file-id" value={fileId} onChange={(e) => setFileId(e.target.value)} placeholder="Paste an uploaded file ID" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="field-label" htmlFor="source-lang">Source language</label>
                <Input id="source-lang" value={source} onChange={(e) => setSource(e.target.value)} placeholder="en" />
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="target-lang">Target language</label>
                <Input id="target-lang" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="es" />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => createJob(projectId || '', fileId, source, target)} disabled={creating || !fileId.trim()}>
                {creating ? <><LoadingSpinner size={4} /> Creating</> : 'Create translation'}
              </Button>
              <Button onClick={() => jobId && checkStatus(jobId)} disabled={!jobId || checking} variant="outline">
                {checking ? <><LoadingSpinner size={4} /> Checking</> : 'Check status'}
              </Button>
            </div>
          </div>
        </AppCard>

        <AppCard title="Job status">
          <div className="space-y-4">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Job ID</span>
                <code className="break-all text-right font-mono text-xs">{jobId ?? 'Not created'}</code>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={status ? 'success' : 'secondary'}>{status ?? 'Waiting'}</Badge>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/30 px-3 py-2">
                <span className="text-muted-foreground">Result file</span>
                <code className="break-all text-right font-mono text-xs">{resultFileId ?? 'Not available'}</code>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  )
}
