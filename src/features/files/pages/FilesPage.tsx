import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFilesStore } from '../store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Badge from '../../../core/ui/Badge'
import StatusBadge from '../../../core/components/StatusBadge'

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export default function FilesPage() {
  const { projectId } = useParams()
  const activeProjectId = projectId ?? ''
  const [selected, setSelected] = useState<File | null>(null)
  const [chunkSize, setChunkSize] = useState(500)
  const [overlap, setOverlap] = useState(50)
  const [doReset, setDoReset] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    fileId,
    files,
    selectedFileIds,
    isLoadingFiles,
    isUploading,
    isProcessing,
    isIndexing,
    loadFiles,
    toggleFileSelection,
    setSelectedFileIds,
    clearSelectedFiles,
    uploadFile,
    processFile,
    pushIndex,
    logs,
    error
  } = useFilesStore()

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedFileIds.includes(file.file_id)),
    [files, selectedFileIds]
  )
  const processingFileId = selectedFileIds[0] ?? fileId

  useEffect(() => {
    if (activeProjectId) void loadFiles(activeProjectId)
  }, [activeProjectId, loadFiles])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Library</p>
          <h1 className="page-title">Files for project {activeProjectId}</h1>
          <p className="page-description">Upload source material, select project files, tune processing options, and push content into the project index.</p>
        </div>
        <StatusBadge status={selectedFileIds.length > 0 ? 'success' : isLoadingFiles ? 'loading' : 'idle'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AppCard title="Project files">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{files.length} files</Badge>
                  <Badge variant="outline">{selectedFileIds.length} selected</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFileIds(activeProjectId, files.map((file) => file.file_id))}
                    disabled={!files.length || isLoadingFiles}
                  >
                    Select all
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => clearSelectedFiles(activeProjectId)} disabled={!selectedFileIds.length}>
                    Clear
                  </Button>
                </div>
              </div>

              {isLoadingFiles && <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Loading project files...</div>}
              {!isLoadingFiles && files.length === 0 && (
                <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  No files found for this project yet.
                </div>
              )}
              <ul className="space-y-2">
                {files.map((file) => {
                  const checked = selectedFileIds.includes(file.file_id)
                  return (
                    <li key={file.file_id} className="rounded-md border bg-background p-3">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFileSelection(activeProjectId, file.file_id)}
                          className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{file.file_name}</span>
                          <span className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span className="break-all font-mono">{file.file_id}</span>
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          </AppCard>

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
              <Button onClick={() => selected && uploadFile(activeProjectId, selected)} disabled={!selected || isUploading || !activeProjectId}>
                {isUploading ? <><LoadingSpinner size={4} /> Uploading</> : 'Upload file'}
              </Button>
            </div>
          </AppCard>

          <AppCard title="Process and index">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">File to process</span>
                <code className="break-all rounded bg-background px-2 py-1 font-mono text-xs">{processingFileId ?? 'Select a project file'}</code>
              </div>
              {processingFileId && (
                <Link
                  to={`/projects/${activeProjectId}/translate?fileId=${encodeURIComponent(processingFileId)}`}
                  className="inline-block text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Translate this file
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
                  onClick={() => processFile(activeProjectId, { file_id: processingFileId || '', chunk_size: chunkSize, overlap_size: overlap, do_reset: doReset })}
                  disabled={!processingFileId || isProcessing}
                >
                  {isProcessing ? <><LoadingSpinner size={4} /> Processing</> : 'Process file'}
                </Button>
                <Button onClick={() => pushIndex(activeProjectId, doReset)} disabled={isIndexing || !activeProjectId} variant="outline">
                  {isIndexing ? <><LoadingSpinner size={4} /> Indexing</> : 'Push index'}
                </Button>
              </div>
              {selectedFiles.length > 1 && (
                <p className="field-hint">Processing uses the first selected file. Ask and Voice can use all selected files as context.</p>
              )}
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
