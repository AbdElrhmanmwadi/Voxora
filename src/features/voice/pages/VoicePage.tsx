import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAudioRecorder from '../hooks/useAudioRecorder'
import { useVoiceStore } from '../store/useVoiceStore'
import { useFilesStore } from '../../files/store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Badge from '../../../core/ui/Badge'
import EmptyState from '../../../core/ui/EmptyState'
import StatusBadge from '../../../core/components/StatusBadge'

export default function VoicePage() {
  const { projectId } = useParams()
  const activeProjectId = projectId ?? ''
  const { start, stop: stopRecording, recording, error: micError } = useAudioRecorder()
  const { transcript, answer, streaming, failed, error, sendAudio, retry, stop: stopStream } = useVoiceStore()
  const { files, selectedFileIds, isLoadingFiles, loadFiles } = useFilesStore()
  const [lastBlobUrl, setLastBlobUrl] = useState<string | null>(null)

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedFileIds.includes(file.file_id)),
    [files, selectedFileIds]
  )
  const hasSelectedFiles = selectedFileIds.length > 0

  useEffect(() => {
    if (activeProjectId) void loadFiles(activeProjectId)
  }, [activeProjectId, loadFiles])

  useEffect(() => {
    return () => {
      if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl)
    }
  }, [lastBlobUrl])

  useEffect(() => () => stopStream(), [stopStream])

  async function handleStop() {
    const blob = await stopRecording()
    const url = URL.createObjectURL(blob)
    setLastBlobUrl(url)
    if (!hasSelectedFiles) return
    await sendAudio(activeProjectId, blob)
  }

  const voiceState = recording ? 'recording' : streaming ? 'processing' : transcript ? 'done' : 'idle'

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Voice</p>
          <h1 className="page-title">Voice AI</h1>
          <p className="page-description">Record a voice question and get a grounded spoken answer from project files.</p>
        </div>
        <StatusBadge status={recording || streaming ? 'loading' : transcript ? 'success' : 'idle'} />
      </div>

      <div className="rounded-md border bg-card">
        <div className="border-b p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                recording ? 'bg-destructive/10 ring-2 ring-destructive/30' :
                streaming ? 'bg-primary/10 ring-2 ring-primary/30' :
                'bg-muted'
              }`}>
                {recording ? (
                  <span className="h-3 w-3 rounded-full bg-destructive animate-pulse-soft" />
                ) : streaming ? (
                  <LoadingSpinner size={5} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-bold font-display">
                  {recording ? 'Recording...' : streaming ? 'Processing...' : 'Ready'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {recording ? 'Speak clearly into your microphone' :
                   streaming ? 'Generating response...' :
                   hasSelectedFiles ? 'Press Record to ask by voice' : 'Select files first'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => void start()} disabled={recording || streaming || !hasSelectedFiles}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
                Record
              </Button>
              {streaming ? (
                <Button onClick={stopStream} variant="outline">Stop</Button>
              ) : (
                <Button onClick={handleStop} disabled={!recording} variant="outline">
                  {recording ? <><LoadingSpinner size={4} /> Stop</> : 'Stop'}
                </Button>
              )}
            </div>
          </div>
          {micError && (
            <div role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {micError}
            </div>
          )}
        </div>

        <div className="grid gap-0 divide-y xl:grid-cols-[minmax(0,1fr)_420px] xl:divide-x xl:divide-y-0">
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground font-display mb-3">Context</h3>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={hasSelectedFiles ? 'success' : 'warning'}>{selectedFileIds.length} selected files</Badge>
              {isLoadingFiles && <span className="text-sm text-muted-foreground">Loading...</span>}
            </div>
            {selectedFiles.length > 0 ? (
              <div className="divide-y rounded-md border">
                {selectedFiles.map((file) => (
                  <div key={file.file_id} className="truncate px-3 py-2 text-sm font-medium">{file.file_name}</div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select files before recording. <Link to={`/projects/${activeProjectId}/files`} className="font-semibold text-primary underline-offset-4 hover:underline">Open files</Link>
              </p>
            )}
            {lastBlobUrl && (
              <div className="mt-4 space-y-2">
                <Badge variant="secondary">Last recording</Badge>
                <audio src={lastBlobUrl} controls className="w-full" aria-label="Last recorded question" />
              </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground font-display mb-3">Transcript</h3>
            <div className="space-y-3">
              {streaming && !transcript && (
                <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">Processing audio...</div>
              )}
              {error && (
                <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <span>{error}</span>
                  {failed && (
                    <Button onClick={() => void retry()} variant="outline" className="shrink-0">Retry</Button>
                  )}
                </div>
              )}
              {transcript ? (
                <div className="rounded-md border bg-muted/20 p-4 text-sm leading-relaxed">{transcript}</div>
              ) : (
                !streaming && <EmptyState title="No transcript yet" description="Record a question to see what was heard." className="p-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      <AppCard title="Answer">
        {answer ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm leading-relaxed">
            {answer}
            {streaming && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse-soft bg-primary/60 align-middle" />}
          </div>
        ) : streaming ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">Generating answer...</div>
        ) : (
          <EmptyState title="No answer generated yet" description="Record a question to hear a grounded spoken answer." />
        )}
      </AppCard>
    </div>
  )
}
