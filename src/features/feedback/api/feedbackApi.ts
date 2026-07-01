import axiosClient from '../../../core/api/axiosClient'
import type { FeedbackCreateResponse } from '../../../types/api.types'

// Backend accepts only a thumbs-up (1) or thumbs-down (-1) — no neutral value.
export type FeedbackRating = 1 | -1

export interface SubmitFeedbackInput {
  question: string
  answer: string
  rating: FeedbackRating
  // The agent session the answer came from; omit/null for a direct RAG answer.
  sessionId?: number | string | null
  comment?: string | null
}

// POST /api/v1/feedback/{project_id} — records one 👍/👎 rating on an answer.
// The bearer token is attached by the axiosClient request interceptor.
export async function submitFeedback(
  projectId: string,
  { question, answer, rating, sessionId = null, comment = null }: SubmitFeedbackInput
): Promise<FeedbackCreateResponse> {
  const res = await axiosClient.post(`/api/v1/feedback/${projectId}`, {
    question,
    answer,
    rating,
    session_id: sessionId ?? null,
    comment: comment ?? null,
  })
  return res.data as FeedbackCreateResponse
}
