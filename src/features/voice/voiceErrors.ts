import { ApiClientError } from '../../core/api/axiosClient'
import type { VoiceSignal } from '../../types/api.types'

// Audio extensions ffmpeg/Whisper can decode. Kept in sync with the backend's
// allow-list so we can reject obviously-bad files before uploading.
export const ACCEPTED_AUDIO_EXTENSIONS = [
  '.wav', '.mp3', '.m4a', '.mp4', '.ogg', '.oga', '.webm',
  '.flac', '.aac', '.opus', '.wma', '.amr', '.3gp',
] as const

interface VoiceErrorBody {
  signal?: VoiceSignal
  // rag_answer_failed still returns the transcript so we can show what the user said.
  transcript?: string
}

export interface MappedVoiceError {
  message: string
  signal?: VoiceSignal
  transcript?: string
}

// The backend now returns generic human messages on purpose, so we branch on
// HTTP status + `signal` (never the message text) to produce friendly copy.
export function mapVoiceError(e: unknown): MappedVoiceError {
  if (!(e instanceof ApiClientError)) {
    return { message: e instanceof Error ? e.message : 'Something went wrong. Please try again.' }
  }

  const body = (e.data ?? {}) as VoiceErrorBody
  const signal = body.signal
  const transcript = body.transcript

  switch (e.status) {
    case 401:
      return { message: 'Your session expired. Please sign in again.', signal, transcript }
    case 404:
      return { message: 'Project not found.', signal, transcript }
    case 413:
      return { message: 'That recording is too large. Try a shorter clip.', signal, transcript }
    case 408:
      return { message: 'Speech-to-text took too long. Try a shorter recording.', signal, transcript }
    case 400:
      switch (signal) {
        case 'file_type_not_supported':
          return { message: 'That audio format is not supported.', signal, transcript }
        case 'stt_failed':
          return { message: "Couldn't understand the audio. Please try again.", signal, transcript }
        case 'rag_answer_failed':
          return { message: 'No answer could be generated from the selected documents.', signal, transcript }
        case 'tts_failed':
          return { message: 'Could not generate the spoken answer.', signal, transcript }
        default:
          return { message: 'Voice processing failed. Please try again.', signal, transcript }
      }
    default:
      return { message: 'Something went wrong. Please try again.', signal, transcript }
  }
}
