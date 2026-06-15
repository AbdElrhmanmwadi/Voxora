import { useEffect, useRef, useState } from 'react'

function describeMicError(e: unknown): string {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return 'Recording is not available. Use a modern browser over HTTPS (or localhost).'
  }
  if (e instanceof DOMException) {
    switch (e.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'Microphone access was blocked. Allow microphone permission in your browser settings, then try again.'
      case 'NotFoundError':
      case 'OverconstrainedError':
        return 'No microphone was found. Connect a microphone and try again.'
      case 'NotReadableError':
        return 'The microphone is in use by another app. Close it and try again.'
    }
  }
  return 'Could not start recording. Check your microphone and try again.'
}

export default function useAudioRecorder() {
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  // Returns true if recording actually started; on failure sets `error` and
  // returns false so callers can avoid acting on a recording that never began.
  async function start(): Promise<boolean> {
    if (mediaRef.current?.state === 'recording') return true
    setError(null)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(describeMicError(undefined))
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.start()
      setRecording(true)
      return true
    } catch (e) {
      releaseStream()
      setError(describeMicError(e))
      return false
    }
  }

  function stop(): Promise<Blob> {
    return new Promise((resolve) => {
      const mr = mediaRef.current
      if (!mr || mr.state === 'inactive') {
        releaseStream()
        return resolve(new Blob())
      }
      mr.onstop = () => {
        releaseStream()
        resolve(new Blob(chunksRef.current, { type: 'audio/webm' }))
      }
      mr.stop()
      setRecording(false)
    })
  }

  useEffect(() => {
    return () => {
      if (mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return { start, stop, recording, error }
}
