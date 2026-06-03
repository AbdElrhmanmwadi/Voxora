import create from 'zustand'
import type { UploadResponse, ProcessResponse, ProjectFile } from '../../../types/api.types'
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
  filesProjectId: string | null
  files: ProjectFile[]
  selectedFileIds: string[]
  isUploading: boolean
  isLoadingFiles: boolean
  isProcessing: boolean
  isIndexing: boolean
  logs: string[]
  error: string | null
  loadFiles: (projectId: string) => Promise<void>
  toggleFileSelection: (projectId: string, fileId: string) => void
  setSelectedFileIds: (projectId: string, fileIds: string[]) => void
  clearSelectedFiles: (projectId: string) => void
  uploadFile: (projectId: string, file: File) => Promise<void>
  processFile: (projectId: string, opts: ProcessOptions) => Promise<void>
  pushIndex: (projectId: string, doReset?: boolean) => Promise<void>
}

export const useFilesStore = create<FilesState>((set, get) => ({
  fileId: null,
  fileProjectId: null,
  filesProjectId: null,
  files: [],
  selectedFileIds: [],
  isUploading: false,
  isLoadingFiles: false,
  isProcessing: false,
  isIndexing: false,
  logs: [],
  error: null,
  loadFiles: async (projectId) => {
    if (!projectId) return
    const state = get()
    set({
      isLoadingFiles: true,
      error: null,
      filesProjectId: projectId,
      selectedFileIds: state.filesProjectId === projectId ? state.selectedFileIds : []
    })
    try {
      const res = await api.listFiles(projectId)
      const selected = get().selectedFileIds.filter((id) => res.files.some((file) => file.file_id === id))
      set({ files: res.files, selectedFileIds: selected })
    } catch (e) {
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isLoadingFiles: false })
    }
  },
  toggleFileSelection: (projectId, fileId) => {
    const state = get()
    const current = state.filesProjectId === projectId ? state.selectedFileIds : []
    const selectedFileIds = current.includes(fileId)
      ? current.filter((id) => id !== fileId)
      : [...current, fileId]
    set({ filesProjectId: projectId, selectedFileIds })
  },
  setSelectedFileIds: (projectId, fileIds) => {
    set({ filesProjectId: projectId, selectedFileIds: Array.from(new Set(fileIds)) })
  },
  clearSelectedFiles: (projectId) => {
    set({ filesProjectId: projectId, selectedFileIds: [] })
  },
  uploadFile: async (projectId, file) => {
    set({ isUploading: true, error: null })
    try {
      const res: UploadResponse = await api.uploadFile(projectId, file)
      saveProjectFileId(projectId, res.file_id)
      set({ fileId: res.file_id, fileProjectId: projectId, logs: [JSON.stringify(res), ...get().logs] })
      await get().loadFiles(projectId)
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
