import { create } from 'zustand'
import * as api from '../api/translationApi'
import { useFilesStore } from '../../files/store/useFilesStore'
import { extractError } from '../../../core/api/apiException'

const jobStorageKey = (projectId: string) => `rag:translationJob:${projectId}`

export function persistTranslationJob(projectId: string, jobId: string, status: string) {
  try {
    sessionStorage.setItem(jobStorageKey(projectId), JSON.stringify({ jobId, status, savedAt: Date.now() }))
  } catch {
    // ignore
  }
}

export function readPersistedJob(projectId: string): { jobId: string; status: string } | null {
  try {
    const raw = sessionStorage.getItem(jobStorageKey(projectId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { jobId?: string; status?: string }
    if (!parsed.jobId) return null
    return { jobId: parsed.jobId, status: parsed.status ?? 'processing' }
  } catch {
    return null
  }
}

interface TranslationState {
  jobId: string | null
  status: string | null
  resultFileId?: string | null
  jobErrorMessage: string | null
  error: string | null
  creating: boolean
  checking: boolean
  createJob: (projectId: string, fileId: string, source: string, target: string) => Promise<void>
  checkStatus: (jobId: string, options?: { silent?: boolean }) => Promise<void>
  restoreJob: (projectId: string) => void
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  jobId: null,
  status: null,
  resultFileId: null,
  jobErrorMessage: null,
  error: null,
  creating: false,
  checking: false,
  createJob: async (projectId, fileId, source, target) => {
    set({ creating: true, error: null, jobErrorMessage: null })
    try {
      const coercedFileIdInput = String(fileId)
      // Map to backend-expected identifier (asset name) when available
      const filesState = useFilesStore.getState()
      const matchedFile = filesState.files.find((f) => f.file_id === coercedFileIdInput || f.file_name === coercedFileIdInput)
      if (!matchedFile) {
        const msg = `File ID not found for project ${projectId}: ${coercedFileIdInput}`
        console.debug('[useTranslationStore] createJob aborted - file not found', { projectId, coercedFileId: coercedFileIdInput })
        set({ error: msg })
        return
      }
      const outboundFileId = matchedFile.file_name ?? coercedFileIdInput
      console.debug('[useTranslationStore] createJob', { projectId, inputFileId: coercedFileIdInput, outboundFileId, source, target })
      const res = await api.createTranslation(projectId, String(outboundFileId), source, target)
      set({ jobId: res.job_id, status: res.status, resultFileId: null })
      persistTranslationJob(projectId, res.job_id, res.status)
    } catch (e) {
      set({ error: extractError(e as unknown) })
    } finally {
      set({ creating: false })
    }
  },
  checkStatus: async (jobId, options) => {
    const silent = options?.silent ?? false
    if (!silent) set({ checking: true, error: null })
    try {
      const res = await api.getTranslationStatus(jobId)
      set({
        status: res.job.status,
        resultFileId: res.job.result_file_id ?? null,
        jobErrorMessage: res.job.error_message ?? null
      })
    } catch (e) {
      if (!silent) set({ error: extractError(e as unknown) })
    } finally {
      if (!silent) set({ checking: false })
    }
  },
  restoreJob: (projectId) => {
    const saved = readPersistedJob(projectId)
    if (!saved) return
    set({ jobId: saved.jobId, status: saved.status })
    void get().checkStatus(saved.jobId, { silent: true })
  }
}))
