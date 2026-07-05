import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRagStore } from '../store/useRagStore'
import { useFilesStore } from '../../files/store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Button from '../../../core/ui/Button'
import Input from '../../../core/ui/Input'
import Textarea from '../../../core/ui/Textarea'
import Badge from '../../../core/ui/Badge'
import Skeleton from '../../../core/ui/Skeleton'
import EmptyState from '../../../core/ui/EmptyState'
import { toast } from '../../../core/ui/toast'
import FeedbackButtons from '../../feedback/components/FeedbackButtons'
import VoiceRecordButton from '../../voice/components/VoiceRecordButton'
import type { SearchResultItem } from '../../../types/api.types'

// `meta_data` shape varies by how a document was processed, so probe a few of
// the keys the backend is known to emit and surface whatever provenance exists.
function sourceFrom(meta: SearchResultItem['meta_data']) {
  const get = (key: string) => {
    const v = meta?.[key]
    return typeof v === 'string' || typeof v === 'number' ? String(v) : undefined
  }
  const file = get('file_name') ?? get('source') ?? get('file_id')
  const page = get('page') ?? get('page_number')
  return { file, page }
}

export default function AskPage() {
  const { projectId } = useParams()
  const activeProjectId = projectId ?? ''
  const [text, setText] = useState('')
  const [limit, setLimit] = useState(5)
  const { results, answer, askedQuestion, loading, error, search, ask } = useRagStore()
  const { files, selectedFileIds, isLoadingFiles, loadFiles } = useFilesStore()

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedFileIds.includes(file.file_id)),
    [files, selectedFileIds]
  )
  const canRun = Boolean(activeProjectId && text.trim() && selectedFileIds.length > 0)

  useEffect(() => {
    if (activeProjectId) void loadFiles(activeProjectId)
  }, [activeProjectId, loadFiles])

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Retrieval</p>
          <h1 className="page-title">Ask project {activeProjectId}</h1>
          <p className="page-description">Search or answer using only the selected files in this project.</p>
        </div>
        <Badge variant="secondary">{results.length} results</Badge>
      </div>

      <AppCard title="Selected context">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={selectedFileIds.length > 0 ? 'success' : 'warning'}>{selectedFileIds.length} selected</Badge>
            {isLoadingFiles && <span className="text-sm text-muted-foreground">Loading project files...</span>}
          </div>
          {selectedFiles.length > 0 ? (
            <ul className="space-y-2">
              {selectedFiles.map((file) => (
                <li key={file.file_id} className="flex flex-col gap-1 rounded-md border bg-muted/30 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{file.file_name}</span>
                  <code className="break-all font-mono text-xs text-muted-foreground">{file.file_id}</code>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              Select at least one file before asking. <Link to={`/projects/${activeProjectId}/files`} className="font-medium text-foreground underline-offset-4 hover:underline">Open files</Link>
            </div>
          )}
        </div>
      </AppCard>

      <AppCard title="Question">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="field-label" htmlFor="question">Prompt</label>
            <Textarea id="question" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question about this project's indexed content..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
            <div className="space-y-2">
              <label className="field-label" htmlFor="limit">Result limit</label>
              <Input id="limit" type="number" min={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <VoiceRecordButton
                disabled={loading}
                onTranscript={(transcript) => {
                  setText(transcript)
                  toast.success('Voice question added')
                }}
                onError={(message) => toast.error(message)}
              />
              <Button onClick={() => search(activeProjectId, text, limit, selectedFileIds)} disabled={loading || !canRun}>
                {loading ? <><LoadingSpinner size={4} /> Searching</> : 'Search'}
              </Button>
              <Button onClick={() => ask(activeProjectId, text, limit, selectedFileIds)} disabled={loading || !canRun} variant="outline">
                {loading ? <><LoadingSpinner size={4} /> Asking</> : 'Ask AI'}
              </Button>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AppCard title="Search results">
          <div className="space-y-3">
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            )}
            {!loading && results.length === 0 && (
              <EmptyState title="No results yet" description="Run a search to inspect the matching context from your selected files." />
            )}
            <ul className="space-y-3">
              {results.map((r, i) => {
                const { file, page } = sourceFrom(r.meta_data)
                return (
                  <li key={i} className="rounded-md border bg-background p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">#{i + 1}</Badge>
                      {file && <Badge variant="outline" className="max-w-full truncate">{file}</Badge>}
                      {page && <Badge variant="outline">p. {page}</Badge>}
                      <Badge variant="outline" className="ml-auto">Score {typeof r.score === 'number' ? r.score.toFixed(3) : r.score}</Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{r.text}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </AppCard>

        <AppCard title="Answer">
          {answer ? (
            <div className="space-y-3">
              <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6">{answer}</div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Grounded in {selectedFiles.length} selected {selectedFiles.length === 1 ? 'file' : 'files'}
                  {selectedFiles.length > 0 && `: ${selectedFiles.map((f) => f.file_name).join(', ')}`}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard?.writeText(answer).then(() => toast.success('Answer copied'))
                  }}
                >
                  Copy
                </Button>
              </div>
              <FeedbackButtons
                projectId={activeProjectId}
                question={askedQuestion ?? ''}
                answer={answer}
              />
            </div>
          ) : (
            <EmptyState title="No answer generated yet" description="Ask a question to generate a grounded answer." />
          )}
        </AppCard>
      </div>
    </div>
  )
}
