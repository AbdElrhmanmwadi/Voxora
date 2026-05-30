import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import useAudioRecorder from '../hooks/useAudioRecorder'
import { useVoiceStore } from '../store/useVoiceStore'
import AppCard from '../../../core/components/AppCard'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import Badge from '../../../core/ui/Badge'
import StatusBadge from '../../../core/components/StatusBadge'

export default function VoicePage() {
  const { projectId } = useParams()
  const { start, stop, recording } = useAudioRecorder()
  const { transcript, answer, loading, error, sendAudio } = useVoiceStore()
  const [lastBlobUrl, setLastBlobUrl] = useState<string | null>(null)

  async function handleStop() {
    const blob = await stop()
    const url = URL.createObjectURL(blob)
    setLastBlobUrl(url)
    await sendAudio(projectId || '', blob)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Voice</p>
          <h1 className="page-title">Speak to project {projectId}</h1>
          <p className="page-description">Record a voice question, submit the audio, and review the transcript with the generated answer.</p>
        </div>
        <StatusBadge status={recording ? 'loading' : transcript ? 'success' : 'idle'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AppCard title="Recorder">
          <div className="space-y-5">
            <div className="rounded-lg border bg-muted/30 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={recording ? 'h-2.5 w-2.5 rounded-full bg-destructive animate-pulse-soft' : 'h-2.5 w-2.5 rounded-full bg-muted-foreground'} />
                    <p className="text-sm font-medium">{recording ? 'Recording in progress' : 'Recorder ready'}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Microphone access is requested by the existing recorder hook.</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => start()} disabled={recording}>Record</Button>
                  <Button onClick={handleStop} disabled={!recording} variant="outline">
                    {!recording ? 'Stop' : <><LoadingSpinner size={4} /> Stop</>}
                  </Button>
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
            {loading && <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Processing audio...</div>}
            {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
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
          <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6">{answer}</div>
        ) : (
          <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">No answer generated yet.</div>
        )}
      </AppCard>
    </div>
  )
}
