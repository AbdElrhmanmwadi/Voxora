import { create } from 'zustand'
import * as api from '../api/voiceApi'
import { createAudioQueue } from '../audioQueue'
import { mapVoiceError } from '../voiceErrors'

interface VoiceState {
  transcript: string | null
  // Answer text, accumulated from streamed deltas (typing effect).
  answer: string
  streaming: boolean
  // True once a send finished with an error and can be retried with the same audio.
  failed: boolean
  error: string | null
  sendAudio: (projectId: string, audio: Blob) => Promise<void>
  retry: () => Promise<void>
  stop: () => void
  reset: () => void
}

// Singletons: the sequential spoken-answer player and the in-flight stream.
const audioQueue = createAudioQueue()
let abortController: AbortController | null = null
// Last send, so a failed answer can be retried with the same audio.
let lastProjectId: string | null = null
let lastAudio: Blob | null = null

export const useVoiceStore = create<VoiceState>((set, get) => ({
  transcript: null,
  answer: '',
  streaming: false,
  failed: false,
  error: null,
  sendAudio: async (projectId, audio) => {
    // Cancel anything still running and clear the playback queue.
    abortController?.abort()
    audioQueue.stop()
    lastProjectId = projectId
    lastAudio = audio

    const controller = new AbortController()
    abortController = controller
    set({ transcript: null, answer: '', error: null, failed: false, streaming: true })

    try {
      await api.streamVoiceChat(
        projectId,
        audio,
        undefined,
        {
          onTranscript: (text) => set({ transcript: text }),
          onDelta: (text) => set((s) => ({ answer: s.answer + text })),
          onAudio: (clip) => audioQueue.enqueue(clip),
          // done.answer is the full text; replacing guards against a dropped delta.
          onDone: (answer) => set((s) => ({ answer: answer || s.answer, streaming: false })),
          // Keep whatever text already streamed in; just mark it failed.
          onError: (detail) => set({ error: detail, failed: true, streaming: false }),
        },
        controller.signal
      )
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        set({ streaming: false })
      } else {
        set({ error: mapVoiceError(e).message, failed: true, streaming: false })
      }
    } finally {
      if (abortController === controller) abortController = null
    }
  },
  retry: async () => {
    if (lastProjectId && lastAudio) await get().sendAudio(lastProjectId, lastAudio)
  },
  stop: () => {
    abortController?.abort()
    audioQueue.stop()
    set({ streaming: false })
  },
  reset: () => {
    abortController?.abort()
    audioQueue.stop()
    set({ transcript: null, answer: '', error: null, failed: false, streaming: false })
  },
}))
