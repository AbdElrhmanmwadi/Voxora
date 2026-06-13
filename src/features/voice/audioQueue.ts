// Streaming voice chat delivers one wav clip per sentence; they must play one
// after another in `seq` order (never overlapping). This queue buffers clips,
// keeps them sorted by seq, and plays them back-to-back.

export interface AudioClip {
  seq: number
  src: string
}

export function createAudioQueue() {
  let queue: AudioClip[] = []
  let playing = false
  let current: HTMLAudioElement | null = null

  function playNext() {
    const next = queue.shift()
    if (!next) {
      playing = false
      return
    }
    playing = true
    const audio = new Audio(next.src)
    current = audio
    const advance = () => {
      current = null
      playNext()
    }
    audio.onended = advance
    audio.onerror = advance
    // Autoplay can be blocked if no user gesture preceded playback; skip rather than stall.
    void audio.play().catch(advance)
  }

  return {
    enqueue(clip: AudioClip) {
      queue.push(clip)
      queue.sort((a, b) => a.seq - b.seq)
      if (!playing) playNext()
    },
    stop() {
      queue = []
      playing = false
      if (current) {
        current.pause()
        current = null
      }
    },
  }
}
