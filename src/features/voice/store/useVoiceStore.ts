import create from 'zustand'
import * as api from '../api/voiceApi'
import { extractError } from '../../../core/api/apiException'

interface VoiceState {
  transcript: string | null
  answer: string | null
  loading: boolean
  error: string | null
  sendAudio: (projectId: string, audio: Blob) => Promise<void>
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  transcript: null,
  answer: null,
  loading: false,
  error: null,
  sendAudio: async (projectId, audio) => {
    set({ loading: true, error: null })
    try {
      const res = await api.voiceChat(projectId, audio, { return_audio_base64: true })
      set({ transcript: res.transcript ?? null, answer: res.answer ?? null })
    } catch (e) {
      set({ error: extractError(e as unknown) })
    } finally {
      set({ loading: false })
    }
  }
}))
