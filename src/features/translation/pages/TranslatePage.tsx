import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslationStore } from '../store/useTranslationStore'
import AppCard from '../../../core/components/AppCard'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'

export default function TranslatePage() {
  const { projectId } = useParams()
  const [fileId, setFileId] = useState('')
  const [source, setSource] = useState('en')
  const [target, setTarget] = useState('es')
  const { jobId, status, resultFileId, creating, checking, createJob, checkStatus, error } = useTranslationStore()

  return (
    <div className="page-container">
      <h2 className="text-2xl font-mono neon-text-orange mb-4">Translate — Project {projectId}</h2>
      <AppCard>
        <label className="text-sm uppercase tracking-wider text-[hsl(var(--muted-foreground))]">File ID</label>
        <Input value={fileId} onChange={(e) => setFileId(e.target.value)} className="mb-2" />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-sm">Source</label>
            <Input value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Target</label>
            <Input value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => createJob(projectId || '', fileId, source, target)} disabled={creating} className="button-smooth">{creating ? 'Creating...' : 'Translate'}</Button>
          <Button onClick={() => jobId && checkStatus(jobId)} disabled={!jobId || checking} variant="ghost">Check Status</Button>
        </div>
      </AppCard>

      <div className="mt-4">
        <AppCard title="Status">
          {error && <div className="text-neon-red">{error}</div>}
          <div className="font-mono">Job ID: {jobId ?? '—'}</div>
          <div>Status: {status ?? '—'}</div>
          <div>Result File ID: {resultFileId ?? '—'}</div>
        </AppCard>
      </div>
    </div>
  )
}
