import { AxiosError } from 'axios'
import axiosClient, { ApiClientError } from '../../../core/api/axiosClient'
import { saveBlobResponse } from '../../../core/api/downloadBlob'
import type { TranslationJobCreateResponse, TranslationJobStatusResponse } from '../../../types/api.types'

async function messageFromBlobError(error: AxiosError<Blob>) {
  const blob = error.response?.data
  if (!(blob instanceof Blob)) return error.message || 'Download failed.'
  try {
    const text = await blob.text()
    const body = JSON.parse(text) as { message?: string; detail?: string }
    return body.message ?? body.detail ?? (text || 'Download failed.')
  } catch {
    return 'Download failed.'
  }
}

export async function createTranslation(project_id: string, file_id: string, source_lang: string, target_lang: string) {
  const numericProjectId = Number(project_id)
  if (!Number.isInteger(numericProjectId)) throw new Error('Invalid project ID.')
  const res = await axiosClient.post(`/translate/file`, { project_id: numericProjectId, file_id, source_lang, target_lang })
  return res.data as TranslationJobCreateResponse
}

export async function getTranslationStatus(jobId: string) {
  const res = await axiosClient.get(`/translate/status/${jobId}`)
  return res.data as TranslationJobStatusResponse
}

export async function downloadTranslation(jobId: string, fallbackFilename = 'translated.txt') {
  try {
    const res = await axiosClient.get(`/translate/download/${jobId}`, { responseType: 'blob' })
    await saveBlobResponse(res, fallbackFilename)
  } catch (e) {
    if (e instanceof AxiosError && e.response?.data instanceof Blob) {
      throw new ApiClientError(await messageFromBlobError(e), e.response.status)
    }
    throw e
  }
}
