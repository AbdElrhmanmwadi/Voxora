import React, { useEffect, useRef, useState } from 'react'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import useAudioRecorder from '../hooks/useAudioRecorder'
import { sttUpload } from '../api/voiceApi'
import { mapVoiceError } from '../voiceErrors'

type Props = {
  disabled?: boolean
  className?: string
  onTranscript: (text: string) => void | Promise<void>
  onError?: (message: string) => void
}

export default function VoiceRecordButton({ disabled, className, onTranscript, onError }: Props) {
  const { start, stop, recording, error: micError } = useAudioRecorder()
  const [transcribing, setTranscribing] = useState(false)
  const reportedMicErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (micError && micError !== reportedMicErrorRef.current) {
      reportedMicErrorRef.current = micError
      onError?.(micError)
    }
  }, [micError, onError])

  async function handleClick() {
    if (disabled || transcribing) return

    if (!recording) {
      await start()
      return
    }

    setTranscribing(true)
    try {
      const audio = await stop()
      const data = await sttUpload(audio)
      const transcript = data.text?.trim()
      if (transcript) await onTranscript(transcript)
      else onError?.("Couldn't understand the audio. Please try again.")
    } catch (e) {
      onError?.(mapVoiceError(e).message)
    } finally {
      setTranscribing(false)
    }
  }

  const busy = recording || transcribing

  return (
    <Button
      type="button"
      variant={recording ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleClick}
      disabled={disabled || transcribing}
      aria-pressed={recording}
      aria-label={recording ? 'Stop recording' : 'Record voice question'}
      title={recording ? 'Stop recording' : 'Record voice question'}
      className={className}
    >
      {transcribing && <LoadingSpinner size={4} />}
      {recording ? 'Stop voice' : busy ? 'Voice' : 'Voice'}
    </Button>
  )
}
