import axiosClient from '../../../core/api/axiosClient'
import type { TranslationJobCreateResponse, TranslationJobStatusResponse } from '../../../types/api.types'

export async function createTranslation(project_id: string, file_id: string, source_lang: string, target_lang: string) {
  const res = await axiosClient.post(`/translate/file`, { project_id, file_id, source_lang, target_lang })
  return res.data as TranslationJobCreateResponse
}

export async function getTranslationStatus(jobId: string) {
  const res = await axiosClient.get(`/translate/status/${jobId}`)
  return res.data as TranslationJobStatusResponse
}
