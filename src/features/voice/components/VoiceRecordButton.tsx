import React, { useEffect, useRef, useState } from 'react'
import Button from '../../../core/ui/Button'
import LoadingSpinner from '../../../core/components/LoadingSpinner'
import useAudioRecorder from '../hooks/useAudioRecorder'
import { sttUpload } from '../api/voiceApi'
import { mapVoiceError } from '../voiceErrors'
import { useI18n } from '../../../core/i18n'

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
  const { t } = useI18n()

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
      else onError?.(t('voice.errors.notUnderstood'))
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
      aria-label={recording ? t('voice.button.stopRecording') : t('voice.button.recordVoice')}
      title={recording ? t('voice.button.stopRecording') : t('voice.button.recordVoice')}
      className={className}
    >
      {transcribing && <LoadingSpinner size={4} />}
      {recording ? (
        <>
          <span className="h-2 w-2 rounded-full bg-destructive-foreground animate-pulse-soft" />
          {t('voice.button.stop')}
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
          {t('voice.button.voice')}
        </>
      )}
    </Button>
  )
}
