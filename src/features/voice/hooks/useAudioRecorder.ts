import { useEffect, useRef, useState } from 'react'

export default function useAudioRecorder() {
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
      if (!mr) return resolve(new Blob())
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        resolve(b)
      }
      mr.stop()
      setRecording(false)
    })
  }

  useEffect(() => {
    return () => {
      if (mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop()
    }
  }, [])

  return { start, stop, recording }
}
