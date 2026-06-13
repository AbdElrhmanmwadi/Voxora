import { create } from 'zustand'
import * as api from '../api/voiceApi'
import { mapVoiceError } from '../voiceErrors'

interface VoiceState {
  transcript: string | null
  answer: string | null
  // data: URL for the spoken answer (no revoke needed, unlike object URLs).
  audioUrl: string | null
  loading: boolean
  error: string | null
  sendAudio: (projectId: string, audio: Blob) => Promise<void>
  reset: () => void
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  transcript: null,
  answer: null,
  audioUrl: null,
  loading: false,
  error: null,
  sendAudio: async (projectId, audio) => {
    set({ loading: true, error: null })
    try {
      const res = await api.voiceChat(projectId, audio, { return_audio_base64: true })
      const audioUrl =
        res.audio_base64 && res.audio_mime_type
          ? `data:${res.audio_mime_type};base64,${res.audio_base64}`
          : null
      set({ transcript: res.transcript ?? null, answer: res.answer ?? null, audioUrl })
    } catch (e) {
      // rag_answer_failed still carries the transcript, so surface it even on error.
      const mapped = mapVoiceError(e)
      set({ error: mapped.message, transcript: mapped.transcript ?? get().transcript })
    } finally {
      set({ loading: false })
    }
  },
  reset: () => set({ transcript: null, answer: null, audioUrl: null, error: null }),
}))
