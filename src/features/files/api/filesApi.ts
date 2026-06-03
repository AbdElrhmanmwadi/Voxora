import axiosClient from '../../../core/api/axiosClient'
import type { UploadResponse, ProcessResponse, IndexPushResponse, FileListResponse } from '../../../types/api.types'

export async function listFiles(projectId: string): Promise<FileListResponse> {
  const res = await axiosClient.get(`/api/v1/data/files/${projectId}`)
  return res.data as FileListResponse
}

export async function uploadFile(projectId: string, file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await axiosClient.post(`/api/v1/data/upload/${projectId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
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
