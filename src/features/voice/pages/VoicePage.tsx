import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useAudioRecorder from '../hooks/useAudioRecorder'
import { useVoiceStore } from '../store/useVoiceStore'
import { useFilesStore } from '../../files/store/useFilesStore'
import AppCard from '../../../core/components/AppCard'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Badge from '../../../core/ui/Badge'
import StatusBadge from '../../../core/components/StatusBadge'

export default function VoicePage() {
  const { projectId } = useParams()
  const activeProjectId = projectId ?? ''
  const { start, stop: stopRecording, recording } = useAudioRecorder()
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

  // Cancel any in-flight stream (and stop playback) when leaving the page.
  useEffect(() => () => stopStream(), [stopStream])

  async function handleStop() {
    const blob = await stopRecording()
    const url = URL.createObjectURL(blob)
    setLastBlobUrl(url)
    if (!hasSelectedFiles) return
    await sendAudio(activeProjectId, blob)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Voice</p>
          <h1 className="page-title">Speak to project {activeProjectId}</h1>
          <p className="page-description">Record a voice question and answer it using only selected project files.</p>
        </div>
        <StatusBadge status={recording || streaming ? 'loading' : transcript ? 'success' : 'idle'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AppCard title="Recorder">
          <div className="space-y-5">
            <div className="space-y-3 rounded-md border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={hasSelectedFiles ? 'success' : 'warning'}>{selectedFileIds.length} selected files</Badge>
                {isLoadingFiles && <span className="text-sm text-muted-foreground">Loading project files...</span>}
              </div>
              {selectedFiles.length > 0 ? (
                <ul className="space-y-2">
                  {selectedFiles.map((file) => (
                    <li key={file.file_id} className="truncate text-sm font-medium">{file.file_name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select files before recording. <Link to={`/projects/${activeProjectId}/files`} className="font-medium text-foreground underline-offset-4 hover:underline">Open files</Link>
                </p>
              )}
            </div>
            <div className="rounded-lg border bg-muted/30 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={recording ? 'h-2.5 w-2.5 rounded-full bg-destructive animate-pulse-soft' : 'h-2.5 w-2.5 rounded-full bg-muted-foreground'} />
                    <p className="text-sm font-medium">{recording ? 'Recording in progress' : streaming ? 'Answering...' : 'Recorder ready'}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Microphone access is requested by the existing recorder hook.</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => start()} disabled={recording || streaming || !hasSelectedFiles}>Record</Button>
                  {streaming ? (
                    <Button onClick={stopStream} variant="outline">Stop</Button>
                  ) : (
                    <Button onClick={handleStop} disabled={!recording} variant="outline">
                      {!recording ? 'Stop' : <><LoadingSpinner size={4} /> Stop</>}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {lastBlobUrl && (
              <div className="space-y-2">
                <Badge variant="secondary">Last recording</Badge>
                <audio src={lastBlobUrl} controls className="w-full" />
              </div>
            )}
          </div>
        </AppCard>

        <AppCard title="Transcript">
          <div className="space-y-3">
            {streaming && !transcript && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Processing audio...</div>
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
              <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6">{transcript}</div>
            ) : (
              <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">No transcript yet.</div>
            )}
          </div>
        </AppCard>
      </div>

      <AppCard title="Answer">
        {answer ? (
          <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6">
            {answer}
            {streaming && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse-soft bg-foreground/60 align-middle" />}
          </div>
        ) : streaming ? (
          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">Generating answer...</div>
        ) : (
          <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">No answer generated yet.</div>
        )}
      </AppCard>
    </div>
  )
}
