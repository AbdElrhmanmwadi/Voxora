import axiosClient from '../../../core/api/axiosClient'
import type { SttResponse, VoiceChatResponse } from '../../../types/api.types'

export async function sttUpload(audio: Blob, language?: string): Promise<SttResponse> {
  const fd = new FormData()
  fd.append('audio', audio as any)
  if (language) fd.append('language', language)
  const res = await axiosClient.post('/api/v1/voice/stt', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data as SttResponse
}

export async function tts(text: string) {
  const res = await axiosClient.post('/api/v1/voice/tts', { text, format: 'wav' }, { responseType: 'arraybuffer' })
  return res.data as ArrayBuffer
}

export async function voiceChat(projectId: string, audio: Blob, options?: { limit?: number; return_audio_base64?: boolean; language?: string; fileIds?: string[] }) {
  const fd = new FormData()
  fd.append('audio', audio as any)
  if (options?.limit) fd.append('limit', String(options.limit))
  if (options?.return_audio_base64) fd.append('return_audio_base64', '1')
  if (options?.language) fd.append('language', options.language)
  options?.fileIds?.forEach((fileId) => fd.append('file_ids', fileId))
  const res = await axiosClient.post(`/api/v1/voice/chat/${projectId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data as VoiceChatResponse
}
