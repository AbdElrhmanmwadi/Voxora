import { create } from 'zustand'
import type { UploadResponse, ProcessResponse, ProjectFile } from '../../../types/api.types'
import * as api from '../api/filesApi'
import { extractError } from '../../../core/api/apiException'
import { toast } from '../../../core/ui/toast'
import { saveProjectFileId } from '../fileIdStorage'
import { ApiClientError } from '../../../core/api/axiosClient'

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
  selectedFileOutboundIds: string[]
  isUploading: boolean
  uploadProgress: number | null
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

// Token to ignore responses from loadFiles calls that were superseded.
let lastLoadToken = 0

export const useFilesStore = create<FilesState>((set, get) => ({
  fileId: null,
  fileProjectId: null,
  filesProjectId: null,
  files: [],
  selectedFileIds: [],
  selectedFileOutboundIds: [],
  isUploading: false,
  uploadProgress: null,
  isLoadingFiles: false,
  isProcessing: false,
  isIndexing: false,
  logs: [],
  error: null,
  loadFiles: async (projectId) => {
    if (!projectId) return
    const state = get()
    // Prevent stale UI: when switching projects clear files & selections immediately
    const switching = state.filesProjectId !== projectId
    lastLoadToken += 1
    const token = lastLoadToken
    set({
      isLoadingFiles: true,
      error: null,
      filesProjectId: projectId,
      files: switching ? [] : state.files,
      selectedFileIds: switching ? [] : state.selectedFileIds,
      fileId: switching ? null : state.fileId,
      fileProjectId: switching ? null : state.fileProjectId
    })
    try {
      // Retry on 404 (project may be newly created) a few times with small backoff
      let attempts = 0
      let res: Awaited<ReturnType<typeof api.listFiles>>
      for (;;) {
        try {
          res = await api.listFiles(projectId)
          break
        } catch (e) {
          attempts += 1
          const isNotFound = e instanceof ApiClientError && e.status === 404
          if (!isNotFound) throw e
          if (attempts >= 3) {
            res = { signal: 'success', files: [] }
            break
          }
          // wait before retrying
          await new Promise((r) => setTimeout(r, 400 * attempts))
        }
      }

      // If another loadFiles was started after this one, ignore this response
      if (lastLoadToken !== token) return

      const selected = get().selectedFileIds.map((s) => String(s)).filter((id) => res.files.some((file) => String(file.file_id) === id))
      // compute outbound ids (asset names) for selected ids
      const outbound = selected.map((id) => res.files.find((f) => String(f.file_id) === id)?.file_name ?? id)
      set({ files: res.files, selectedFileIds: selected, selectedFileOutboundIds: outbound })
    } catch (e) {
      set({ error: extractError(e), logs: [String(e), ...get().logs] })
    } finally {
      if (lastLoadToken === token) set({ isLoadingFiles: false })
    }
  },
  toggleFileSelection: (projectId, fileId) => {
    const state = get()
    const idStr = String(fileId)
    const current = state.filesProjectId === projectId ? state.selectedFileIds.map((s) => String(s)) : []
    // Single-selection behaviour: select only this file, or clear if it was already selected
    const selectedFileIds = current.includes(idStr) ? [] : [idStr]
    // sync outbound ids
    const outbound = selectedFileIds.map((id) => state.files.find((f) => String(f.file_id) === id)?.file_name ?? id)
    set({ filesProjectId: projectId, selectedFileIds, selectedFileOutboundIds: outbound })
    // persist last selected outbound id for this project so TranslatePage can autofill
    if (outbound.length > 0) saveProjectFileId(projectId, outbound[0])
  },
  setSelectedFileIds: (projectId, fileIds) => {
    const dedup = Array.from(new Set(fileIds.map((i) => String(i))))
    const outbound = dedup.map((id) => get().files.find((f) => String(f.file_id) === id)?.file_name ?? id)
    set({ filesProjectId: projectId, selectedFileIds: dedup, selectedFileOutboundIds: outbound })
    if (outbound.length > 0) saveProjectFileId(projectId, outbound[0])
  },
  clearSelectedFiles: (projectId) => {
    set({ filesProjectId: projectId, selectedFileIds: [], selectedFileOutboundIds: [] })
    saveProjectFileId(projectId, '')
  },
  uploadFile: async (projectId, file) => {
    set({ isUploading: true, uploadProgress: 0, error: null })
    try {
      const res: UploadResponse = await api.uploadFile(projectId, file, (percent) =>
        set({ uploadProgress: percent })
      )
      saveProjectFileId(projectId, res.file_id)
      // Clear any previous fileId from other projects
      set({ fileId: res.file_id, fileProjectId: projectId, logs: [JSON.stringify(res), ...get().logs] })
      await get().loadFiles(projectId)
      toast.success('File uploaded', file.name)
    } catch (e) {
      const message = extractError(e)
      set({ error: message, logs: [String(e), ...get().logs] })
      toast.error('Upload failed', message)
    } finally {
      set({ isUploading: false, uploadProgress: null })
    }
  },
  processFile: async (projectId, opts) => {
    // Resolve outbound file identifier: backend may expect asset name instead of numeric file_id
    const state = get()
    const requestedId = String(opts.file_id)
    const matchedFile = state.files.find((f) => f.file_id === requestedId || f.file_name === requestedId)
    const outboundId = matchedFile?.file_name ?? requestedId
    const coercedOpts = { ...opts, file_id: String(outboundId) }
    set({ isProcessing: true, error: null })
    try {
      // Validate file exists in current project files to avoid server 'File ID not found'
      if (!matchedFile) {
        const msg = `File ID not found: ${coercedOpts.file_id}`
        set({ error: msg, logs: [msg, ...get().logs] })
        toast.error('Cannot process file', msg)
        return
      }

      const res: ProcessResponse = await api.processFile(projectId, coercedOpts)
      set({ logs: [JSON.stringify(res), ...get().logs] })
      toast.success('File processed', `${res.inserted_chunks} chunks inserted`)
    } catch (e) {
      const message = extractError(e)
      set({ error: message, logs: [String(e), ...get().logs] })
      toast.error('Processing failed', message)
    } finally {
      set({ isProcessing: false })
    }
  },
  pushIndex: async (projectId, doReset = false) => {
    set({ isIndexing: true, error: null })
    try {
      const res = await api.pushIndex(projectId, doReset)
      set({ logs: [JSON.stringify(res), ...get().logs] })
      toast.success(doReset ? 'Index reset and rebuilt' : 'Index updated')
    } catch (e) {
      const message = extractError(e)
      set({ error: message, logs: [String(e), ...get().logs] })
      toast.error('Indexing failed', message)
    } finally {
      set({ isIndexing: false })
    }
  }
}))
