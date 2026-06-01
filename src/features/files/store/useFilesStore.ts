import create from 'zustand'
import type { UploadResponse, ProcessResponse } from '../../../types/api.types'
import * as api from '../api/filesApi'
import { extractError } from '../../../core/api/apiException'
import { saveProjectFileId } from '../fileIdStorage'

interface ProcessOptions {
  file_id: string
  chunk_size?: number
  overlap_size?: number
  do_reset?: boolean
}

interface FilesState {
  fileId: string | null
  fileProjectId: string | null
  isUploading: boolean
  isProcessing: boolean
  isIndexing: boolean
  logs: string[]
  error: string | null
  uploadFile: (projectId: string, file: File) => Promise<void>
  processFile: (projectId: string, opts: ProcessOptions) => Promise<void>
  pushIndex: (projectId: string, doReset?: boolean) => Promise<void>
}

export const useFilesStore = create<FilesState>((set, get) => ({
  fileId: null,
  fileProjectId: null,
  isUploading: false,
  isProcessing: false,
  isIndexing: false,
  logs: [],
  error: null,
  uploadFile: async (projectId, file) => {
    set({ isUploading: true, error: null })
    try {
      const res: UploadResponse = await api.uploadFile(projectId, file)
      saveProjectFileId(projectId, res.file_id)
      set({ fileId: res.file_id, fileProjectId: projectId, logs: [JSON.stringify(res), ...get().logs] })
    } catch (e) {
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isUploading: false })
    }
  },
  processFile: async (projectId, opts) => {
    set({ isProcessing: true, error: null })
    try {
      const res: ProcessResponse = await api.processFile(projectId, opts)
      set({ logs: [JSON.stringify(res), ...get().logs] })
    } catch (e) {
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isProcessing: false })
    }
  },
  pushIndex: async (projectId, doReset = false) => {
    set({ isIndexing: true, error: null })
    try {
      const res = await api.pushIndex(projectId, doReset)
      set({ logs: [JSON.stringify(res), ...get().logs] })
    } catch (e) {
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isIndexing: false })
    }
  }
}))
