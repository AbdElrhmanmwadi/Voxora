import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFilesStore } from '../store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'

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
      <h2 className="text-2xl font-mono neon-text-blue mb-4">Files — Project {projectId}</h2>
      <AppCard title="Upload File">
        <Input type="file" accept=".txt,.pdf,.docx,.csv,.html,.xlsx" onChange={(e) => setSelected(e.target.files?.[0] ?? null)} className="input-dark input-focus-blue" />
        {selected && <div className="mt-2 font-mono">Selected: {selected.name}</div>}
        <div className="mt-3">
          <Button onClick={() => selected && uploadFile(projectId || '', selected)} disabled={!selected || isUploading}>
            {isUploading ? <><LoadingSpinner size={4} /> Uploading</> : 'Upload'}
          </Button>
        </div>
      </AppCard>

      <div className="mt-4">
        <AppCard title="Process">
          <div className="mb-2 font-mono">Current file_id: {fileId ?? '—'}</div>
          <button onClick={() => setShowAdvanced((s) => !s)} className="text-sm text-blue-600 underline mb-2">Advanced options</button>
          {showAdvanced && (
            <div className="space-y-2">
              <label>Chunk size</label>
              <input type="number" value={chunkSize} onChange={(e) => setChunkSize(Number(e.target.value))} className="border px-2 py-1" />
              <label>Overlap</label>
              <input type="number" value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} className="border px-2 py-1" />
              <label className="flex items-center"><input type="checkbox" checked={doReset} onChange={(e) => setDoReset(e.target.checked)} className="mr-2" /> do_reset</label>
            </div>
          )}
            <div className="mt-3 flex items-center gap-3">
            <Button onClick={() => processFile(projectId || '', { file_id: fileId || '', chunk_size: chunkSize, overlap_size: overlap, do_reset: doReset })} disabled={!fileId || isProcessing}>{isProcessing ? <><LoadingSpinner size={4} /> Processing</> : 'Process'}</Button>
            <Button onClick={() => pushIndex(projectId || '', doReset)} disabled={isIndexing} variant="ghost">{isIndexing ? 'Indexing...' : 'Index'}</Button>
          </div>
        </AppCard>
      </div>

      <div className="mt-4">
        <AppCard title="Activity Log">
          {error && <div className="text-neon-red">Error: {error}</div>}
          <ul className="log-panel">
            {logs.length === 0 && <li className="text-[hsl(var(--muted-foreground))]">No activity yet</li>}
            {logs.map((l, i) => (
              <li key={i} className="text-sm break-words">{l}</li>
            ))}
          </ul>
        </AppCard>
      </div>
    </div>
  )
}
