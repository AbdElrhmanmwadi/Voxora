import axiosClient from '../../../core/api/axiosClient'
import { getAccessToken } from '../../../core/auth/authStorage'
import type { SttResponse, VoiceChatResponse, VoiceSignal } from '../../../types/api.types'
import { ACCEPTED_AUDIO_EXTENSIONS, mapVoiceStatus } from '../voiceErrors'

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

export interface VoiceStreamHandlers {
  onTranscript: (text: string) => void
  onDelta: (text: string) => void
  onAudio: (clip: { seq: number; src: string }) => void
  onDone: (answer: string) => void
  onError: (detail: string) => void
}

// Streaming voice chat over SSE. Native EventSource can't POST FormData or send
// Authorization, so we read the stream from fetch (same approach as agent chat).
// Event order: transcript (once) -> delta* -> audio* -> done | error.
export async function streamVoiceChat(
  projectId: string,
  audio: Blob,
  options: { limit?: number; language?: string } | undefined,
  handlers: VoiceStreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  if (!isAcceptedAudio(audio)) throw new UnsupportedAudioError()

  const base = axiosClient.defaults.baseURL || ''
  const fd = new FormData()
  appendAudio(fd, audio)
  fd.append('stream', 'true')
  fd.append('limit', String(options?.limit ?? 30))
  const url = options?.language
    ? `/api/v1/voice/chat/${projectId}?language=${encodeURIComponent(options.language)}`
    : `/api/v1/voice/chat/${projectId}`

  const res = await fetch(`${base}${url}`, {
    method: 'POST',
    // No Content-Type: the browser sets multipart/form-data + boundary for FormData.
    headers: { Authorization: `Bearer ${getAccessToken() || ''}` },
    body: fd,
    signal,
  })

  if (res.status === 401) {
    // fetch bypasses the axios interceptors, so route this one request through
    // axios (which refreshes the token and retries). It arrives non-streamed
    // this once; replay it through the streaming handlers.
    const data = await voiceChat(projectId, audio, { ...options, return_audio_base64: true })
    if (data.transcript) handlers.onTranscript(data.transcript)
    if (data.answer) handlers.onDelta(data.answer)
    if (data.audio_base64 && data.audio_mime_type) {
      handlers.onAudio({ seq: 0, src: `data:${data.audio_mime_type};base64,${data.audio_base64}` })
    }
    handlers.onDone(data.answer || '')
    return
  }

  const contentType = res.headers.get('content-type') || ''
  if (!res.ok || !contentType.includes('text/event-stream')) {
    // Auth/project/upload errors (404/400/413) arrive as plain JSON before the stream.
    const json = (await res.json().catch(() => null)) as { signal?: VoiceSignal; transcript?: string } | null
    handlers.onError(mapVoiceStatus(res.status, json?.signal, json?.transcript).message)
    return
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let sawTerminal = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sep: number
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)

      let event = ''
      let data = ''
      for (const line of block.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7).trim()
        else if (line.startsWith('data: ')) data = line.slice(6)
      }
      if (!data) continue

      let payload: Record<string, unknown>
      try {
        payload = JSON.parse(data)
      } catch {
        continue
      }

      if (event === 'transcript') handlers.onTranscript(String(payload.text ?? ''))
      else if (event === 'delta') handlers.onDelta(String(payload.text ?? ''))
      else if (event === 'audio') {
        if (payload.audio_base64) {
          handlers.onAudio({
            seq: Number(payload.seq ?? 0),
            src: `data:${payload.mime_type ?? 'audio/wav'};base64,${payload.audio_base64}`,
          })
        }
      } else if (event === 'done') {
        sawTerminal = true
        handlers.onDone(String(payload.answer ?? ''))
      } else if (event === 'error') {
        sawTerminal = true
        handlers.onError(String(payload.detail ?? 'Stream error'))
      }
    }
  }

  if (!sawTerminal) handlers.onError('Connection lost before the answer finished')
}
