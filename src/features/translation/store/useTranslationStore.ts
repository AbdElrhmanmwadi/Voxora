import create from 'zustand'
import * as api from '../api/translationApi'
import { extractError } from '../../../core/api/apiException'

interface TranslationState {
  jobId: string | null
  status: string | null
  resultFileId?: string | null
  error: string | null
  creating: boolean
  checking: boolean
  createJob: (projectId: string, fileId: string, source: string, target: string) => Promise<void>
  checkStatus: (jobId: string) => Promise<void>
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  jobId: null,
  status: null,
  resultFileId: null,
  error: null,
  creating: false,
  checking: false,
  createJob: async (projectId, fileId, source, target) => {
    set({ creating: true, error: null })
    try {
      const res = await api.createTranslation(projectId, fileId, source, target)
      set({ jobId: res.job_id, status: res.status })
    } catch (e) {
      set({ error: extractError(e as unknown) })
    } finally {
      set({ creating: false })
    }
  },
  checkStatus: async (jobId) => {
    set({ checking: true, error: null })
    try {
      const res = await api.getTranslationStatus(jobId)
      set({ status: res.job.status, resultFileId: res.job.result_file_id })
    } catch (e) {
      set({ error: extractError(e as unknown) })
    } finally {
      set({ checking: false })
    }
  }
}))
