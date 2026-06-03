import axiosClient from '../../../core/api/axiosClient'
import type { SearchResponse, RagAnswerResponse } from '../../../types/api.types'

export async function searchIndex(projectId: string, text: string, limit = 5, fileIds: string[] = []): Promise<SearchResponse> {
  const res = await axiosClient.post(`/api/v1/nlp/index/search/${projectId}`, { text, limit, file_ids: fileIds })
  return res.data as SearchResponse
}

export async function askQuestion(projectId: string, text: string, limit = 5, fileIds: string[] = []): Promise<RagAnswerResponse> {
  const res = await axiosClient.post(`/api/v1/nlp/index/answer/${projectId}`, { text, limit, file_ids: fileIds })
  return res.data as RagAnswerResponse
}
