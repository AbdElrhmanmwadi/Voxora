import axiosClient from '../../../core/api/axiosClient'
import type { UploadResponse, ProcessResponse, IndexPushResponse, FileListResponse } from '../../../types/api.types'

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
const ACCEPTED_FILE_TYPES = new Set(['txt', 'md', 'pdf', 'docx', 'csv', 'html'])

export function validateUploadFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !ACCEPTED_FILE_TYPES.has(extension)) return 'This file type is not supported. Choose TXT, MD, PDF, DOCX, CSV, or HTML.'
  if (file.size > MAX_UPLOAD_BYTES) return 'The uploaded file exceeds the allowed size (25 MB).'
  return null
}

export async function listFiles(projectId: string): Promise<FileListResponse> {
  const res = await axiosClient.get(`/api/v1/data/files/${projectId}`)
  return res.data as FileListResponse
}

export async function uploadFile(
  projectId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const validationError = validateUploadFile(file)
  if (validationError) throw new Error(validationError)
  const fd = new FormData()
  fd.append('file', file)
  const res = await axiosClient.post(`/api/v1/data/upload/${projectId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
    }
  })
  return res.data as UploadResponse
}

export async function processFile(projectId: string, payload: { file_id: string; chunk_size?: number; overlap_size?: number; do_reset?: boolean }): Promise<ProcessResponse> {
  const res = await axiosClient.post(`/api/v1/data/process/${projectId}`, payload)
  return res.data as ProcessResponse
}

export async function pushIndex(projectId: string, do_reset = false): Promise<IndexPushResponse> {
  const res = await axiosClient.post(`/api/v1/nlp/index/push/${projectId}`, { do_reset })
  return res.data as IndexPushResponse
}

export async function getIndexInfo(projectId: string) {
  const res = await axiosClient.get(`/api/v1/nlp/index/info/${projectId}`)
  return res.data
}
