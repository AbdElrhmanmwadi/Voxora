import { useEffect, useRef, useState } from 'react'

export default function useAudioRecorder() {
  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  async function start() {
    if (mediaRef.current?.state === 'recording') return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const mr = new MediaRecorder(stream)
    mediaRef.current = mr
    chunksRef.current = []
    mr.ondataavailable = (e) => chunksRef.current.push(e.data)
    mr.start()
    setRecording(true)
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

  return { start, stop, recording }
}
