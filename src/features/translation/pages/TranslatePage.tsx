import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslationStore } from '../store/useTranslationStore'
import AppCard from '../../../core/components/AppCard'

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
        <input value={fileId} onChange={(e) => setFileId(e.target.value)} className="input-dark input-focus-orange mb-2" />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-sm">Source</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} className="input-dark" />
          </div>
          <div>
            <label className="text-sm">Target</label>
            <input value={target} onChange={(e) => setTarget(e.target.value)} className="input-dark" />
          </div>
        </div>
        <div>
          <button disabled={creating} onClick={() => createJob(projectId || '', fileId, source, target)} className="btn-neon-orange mr-2 disabled:opacity-50">{creating ? 'Creating...' : 'Translate'}</button>
          <button disabled={!jobId || checking} onClick={() => jobId && checkStatus(jobId)} className="btn-neon-blue disabled:opacity-50">Check Status</button>
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
