import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import useAudioRecorder from '../hooks/useAudioRecorder'
import { useVoiceStore } from '../store/useVoiceStore'
import AppCard from '../../../core/components/AppCard'

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
      <h2 className="text-2xl font-mono neon-text-purple mb-4">Voice — Project {projectId}</h2>
      <AppCard>
        <div className="space-x-2">
          <button onClick={() => start()} disabled={recording} className={`btn-neon-purple ${recording ? 'opacity-50' : ''}`}>Record</button>
          <button onClick={handleStop} disabled={!recording} className={`btn-neon-red ${!recording ? 'opacity-50' : ''}`}>Stop</button>
        </div>
        {lastBlobUrl && <audio src={lastBlobUrl} controls className="mt-3 w-full" />}
      </AppCard>

      <div className="mt-4">
        <AppCard title="Transcript">
          {loading && <div className="text-[hsl(var(--muted-foreground))]">Processing...</div>}
          {error && <div className="text-neon-red">{error}</div>}
          {transcript ? <div className="font-mono">{transcript}</div> : <div className="text-[hsl(var(--muted-foreground))]">No transcript yet</div>}
        </AppCard>
      </div>

      <div className="mt-4">
        <AppCard title="Answer">
          {answer ? <div className="font-mono">{answer}</div> : <div className="text-[hsl(var(--muted-foreground))]">No answer yet</div>}
        </AppCard>
      </div>
    </div>
  )
}
