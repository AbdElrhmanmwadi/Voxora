import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFilesStore } from '../store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Badge from '../../../core/ui/Badge'
import StatusBadge from '../../../core/components/StatusBadge'

export default function FilesPage() {
  const { projectId } = useParams()
  const [selected, setSelected] = useState<File | null>(null)
  const [chunkSize, setChunkSize] = useState(500)
  const [overlap, setOverlap] = useState(50)
  const [doReset, setDoReset] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { fileId, isUploading, isProcessing, isIndexing, uploadFile, processFile, pushIndex, logs, error } = useFilesStore()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Library</p>
          <h1 className="page-title">Files for project {projectId}</h1>
          <p className="page-description">Upload source material, tune processing options, and push content into the project index.</p>
        </div>
        <StatusBadge status={fileId ? 'success' : 'idle'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AppCard title="Upload file">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="field-label" htmlFor="asset-file">Source file</label>
                <Input id="asset-file" type="file" accept=".txt,.pdf,.docx,.csv,.html,.xlsx" onChange={(e) => setSelected(e.target.files?.[0] ?? null)} />
                <p className="field-hint">Supported formats: TXT, PDF, DOCX, CSV, HTML, and XLSX.</p>
              </div>
              {selected && (
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Selected: </span>
                  <span className="font-medium">{selected.name}</span>
                </div>
              )}
              <Button onClick={() => selected && uploadFile(projectId || '', selected)} disabled={!selected || isUploading}>
                {isUploading ? <><LoadingSpinner size={4} /> Uploading</> : 'Upload file'}
              </Button>
            </div>
          </AppCard>

          <AppCard title="Process and index">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">Current file ID</span>
                <code className="break-all rounded bg-background px-2 py-1 font-mono text-xs">{fileId ?? 'No file uploaded'}</code>
              </div>
              {fileId && (
                <Link
                  to={`/projects/${projectId}/translate?fileId=${encodeURIComponent(fileId)}`}
                  className="inline-block text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Translate this file →
                </Link>
              )}

              <Button variant="outline" size="sm" onClick={() => setShowAdvanced((s) => !s)}>
                {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
              </Button>

              {showAdvanced && (
                <div className="grid gap-4 rounded-md border bg-muted/20 p-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="chunk-size">Chunk size</label>
                    <Input id="chunk-size" type="number" min={1} value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="overlap">Overlap</label>
                    <Input id="overlap" type="number" min={0} value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} />
                  </div>
                  <label className="flex min-h-10 items-center gap-2 text-sm font-medium sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={doReset}
                      onChange={(e) => setDoReset(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                    Reset index before running
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => processFile(projectId || '', { file_id: fileId || '', chunk_size: chunkSize, overlap_size: overlap, do_reset: doReset })}
                  disabled={!fileId || isProcessing}
                >
                  {isProcessing ? <><LoadingSpinner size={4} /> Processing</> : 'Process file'}
                </Button>
                <Button onClick={() => pushIndex(projectId || '', doReset)} disabled={isIndexing} variant="outline">
                  {isIndexing ? <><LoadingSpinner size={4} /> Indexing</> : 'Push index'}
                </Button>
              </div>
            </div>
          </AppCard>
        </div>

        <AppCard title="Activity log">
          <div className="space-y-3">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">Error: {error}</div>}
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{logs.length} events</Badge>
            </div>
            <ul className="log-panel">
              {logs.length === 0 && <li>No activity yet.</li>}
              {logs.map((l, i) => (
                <li key={i} className="break-words">{l}</li>
              ))}
            </ul>
          </div>
        </AppCard>
      </div>
    </div>
  )
}
