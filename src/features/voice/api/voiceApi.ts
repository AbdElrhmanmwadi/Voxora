import axiosClient from '../../../core/api/axiosClient'
import type { SttResponse, VoiceChatResponse } from '../../../types/api.types'
import { ACCEPTED_AUDIO_EXTENSIONS } from '../voiceErrors'

// Without this, the axios instance's default `Content-Type: application/json`
// makes axios serialize the FormData to JSON (axios 1.x defaults), and the
// multipart endpoint rejects it with 422. Setting multipart/form-data here lets
// axios pass the FormData through so the browser adds the boundary.
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } } as const

// The backend validates the upload by its filename extension, so a Blob sent
// without a filename (FastAPI sees "blob", no extension) is now rejected with
// 400 file_type_not_supported. Always give the upload a real, allowed name.
const MIME_TO_EXTENSION: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/wave': '.wav',
  'audio/x-wav': '.wav',
  'audio/mp4': '.mp4',
  'audio/x-m4a': '.m4a',
  'audio/mpeg': '.mp3',
  'audio/aac': '.aac',
  'audio/flac': '.flac',
}

function audioFilename(audio: Blob): string {
  const ext = MIME_TO_EXTENSION[audio.type?.split(';')[0]?.trim() ?? ''] ?? '.webm'
  return `recording${ext}`
}

function appendAudio(fd: FormData, audio: Blob) {
  fd.append('audio', audio, audioFilename(audio))
}

export class UnsupportedAudioError extends Error {
  constructor() {
    super('That audio format is not supported.')
    this.name = 'UnsupportedAudioError'
  }
}

// Client-side mirror of the server check, for a fast/clear failure before upload.
export function isAcceptedAudio(audio: Blob): boolean {
  const ext = MIME_TO_EXTENSION[audio.type?.split(';')[0]?.trim() ?? '']
  return ext !== undefined && (ACCEPTED_AUDIO_EXTENSIONS as readonly string[]).includes(ext)
}

export async function sttUpload(audio: Blob, language?: string): Promise<SttResponse> {
  if (!isAcceptedAudio(audio)) throw new UnsupportedAudioError()
  const fd = new FormData()
  appendAudio(fd, audio)
  const url = language ? `/api/v1/voice/stt?language=${encodeURIComponent(language)}` : '/api/v1/voice/stt'
  const res = await axiosClient.post(url, fd, MULTIPART)
  return res.data as SttResponse
}

export async function tts(text: string) {
  const res = await axiosClient.post('/api/v1/voice/tts', { text, format: 'wav' }, { responseType: 'arraybuffer' })
  return res.data as ArrayBuffer
}

export async function voiceChat(
  projectId: string,
  audio: Blob,
  options?: { limit?: number; return_audio_base64?: boolean; language?: string }
): Promise<VoiceChatResponse> {
  if (!isAcceptedAudio(audio)) throw new UnsupportedAudioError()
  const fd = new FormData()
  appendAudio(fd, audio)
  fd.append('limit', String(options?.limit ?? 30))
  fd.append('return_audio_base64', options?.return_audio_base64 === false ? 'false' : 'true')
  const url = options?.language
    ? `/api/v1/voice/chat/${projectId}?language=${encodeURIComponent(options.language)}`
    : `/api/v1/voice/chat/${projectId}`
  const res = await axiosClient.post(url, fd, MULTIPART)
  return res.data as VoiceChatResponse
}

// Raw-audio variant (return_audio_base64=false): the answer comes back as a wav
// body with the transcript in the percent-encoded X-Transcript header.
export async function voiceChatRaw(
  projectId: string,
  audio: Blob,
  options?: { limit?: number; language?: string }
): Promise<{ audio: ArrayBuffer; transcript: string }> {
  if (!isAcceptedAudio(audio)) throw new UnsupportedAudioError()
  const fd = new FormData()
  appendAudio(fd, audio)
  fd.append('limit', String(options?.limit ?? 30))
  fd.append('return_audio_base64', 'false')
  const url = options?.language
    ? `/api/v1/voice/chat/${projectId}?language=${encodeURIComponent(options.language)}`
    : `/api/v1/voice/chat/${projectId}`
  const res = await axiosClient.post(url, fd, { ...MULTIPART, responseType: 'arraybuffer' })
  const transcript = decodeURIComponent((res.headers['x-transcript'] as string | undefined) ?? '')
  return { audio: res.data as ArrayBuffer, transcript }
}
