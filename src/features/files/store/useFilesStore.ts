import create from 'zustand'
import type { UploadResponse, ProcessResponse, ProjectFile } from '../../../types/api.types'
import * as api from '../api/filesApi'
import { extractError } from '../../../core/api/apiException'
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
  selectedFileOutboundIds: [],
  isUploading: false,
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
    // token to avoid race conditions where an earlier request resolves later
    ;(get as any)._lastLoadToken = ((get as any)._lastLoadToken || 0) + 1
    const token = (get as any)._lastLoadToken
    console.debug('[useFilesStore] loadFiles start', { projectId, token, switching })
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
          console.debug('[useFilesStore] listFiles error', { projectId, attempts, isNotFound, err: String(e) })
          if (!isNotFound || attempts >= 3) throw e
          // wait before retrying
          await new Promise((r) => setTimeout(r, 400 * attempts))
        }
      }

      // If another loadFiles was started after this one, ignore this response
      if ((get as any)._lastLoadToken !== token) {
        console.debug('[useFilesStore] ignoring stale loadFiles response', { projectId, token })
        return
      }

      const selected = get().selectedFileIds.map((s) => String(s)).filter((id) => res.files.some((file) => String(file.file_id) === id))
      // compute outbound ids (asset names) for selected ids
      const outbound = selected.map((id) => res.files.find((f) => String(f.file_id) === id)?.file_name ?? id)
      console.debug('[useFilesStore] loadFiles success', { projectId, filesCount: res.files.length, selectedCount: selected.length })
      set({ files: res.files, selectedFileIds: selected, selectedFileOutboundIds: outbound })
    } catch (e) {
      console.debug('[useFilesStore] loadFiles failed', { projectId, err: String(e) })
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isLoadingFiles: false })
    }
  },
  toggleFileSelection: (projectId, fileId) => {
    const state = get()
    const idStr = String(fileId)
    const current = state.filesProjectId === projectId ? state.selectedFileIds.map((s) => String(s)) : []
    // Single-selection behaviour: select only this file, or clear if it was already selected
    const selectedFileIds = current.includes(idStr) ? [] : [idStr]
    // sync outbound ids
    const outbound = selectedFileIds.map((id) => get().files.find((f) => String(f.file_id) === id)?.file_name ?? id)
    console.debug('[useFilesStore] toggleFileSelection', { projectId, fileId, selectedCount: selectedFileIds.length })
    set({ filesProjectId: projectId, selectedFileIds, selectedFileOutboundIds: outbound })
    // persist last selected outbound id for this project so TranslatePage can autofill
    if (outbound.length > 0) saveProjectFileId(projectId, outbound[0])
  },
  setSelectedFileIds: (projectId, fileIds) => {
    const dedup = Array.from(new Set(fileIds.map((i) => String(i))))
    const outbound = dedup.map((id) => get().files.find((f) => String(f.file_id) === id)?.file_name ?? id)
    console.debug('[useFilesStore] setSelectedFileIds', { projectId, fileIdsCount: fileIds.length })
    set({ filesProjectId: projectId, selectedFileIds: dedup, selectedFileOutboundIds: outbound })
    if (outbound.length > 0) saveProjectFileId(projectId, outbound[0])
  },
  clearSelectedFiles: (projectId) => {
    console.debug('[useFilesStore] clearSelectedFiles', { projectId })
    set({ filesProjectId: projectId, selectedFileIds: [], selectedFileOutboundIds: [] })
    try {
      saveProjectFileId(projectId, '')
    } catch {}
  },
  uploadFile: async (projectId, file) => {
    console.debug('[useFilesStore] uploadFile start', { projectId, fileName: file.name })
    set({ isUploading: true, error: null })
    try {
      const res: UploadResponse = await api.uploadFile(projectId, file)
      saveProjectFileId(projectId, res.file_id)
      // Clear any previous fileId from other projects
      set({ fileId: res.file_id, fileProjectId: projectId, logs: [JSON.stringify(res), ...get().logs] })
      console.debug('[useFilesStore] uploadFile succeeded', { projectId, fileId: res.file_id })
      await get().loadFiles(projectId)
    } catch (e) {
      console.debug('[useFilesStore] uploadFile failed', { projectId, err: String(e) })
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isUploading: false })
    }
  },
  processFile: async (projectId, opts) => {
    // Resolve outbound file identifier: backend may expect asset name instead of numeric file_id
    const state = get()
    const requestedId = String(opts.file_id)
    const matchedFile = state.files.find((f) => f.file_id === requestedId || f.file_name === requestedId)
    const outboundId = matchedFile ? matchedFile.file_name ?? requestedId : requestedId
    const coercedOpts = { ...opts, file_id: String(outboundId) }
    console.debug('[useFilesStore] processFile start', { projectId, requestedId, outboundId, opts: coercedOpts })
    set({ isProcessing: true, error: null })
    try {
      // Validate file exists in current project files to avoid server 'File ID not found'
      const projectMatches = state.filesProjectId === projectId
      const fileExists = state.files.some((f) => f.file_id === requestedId || f.file_name === coercedOpts.file_id)
      if (!fileExists) {
        const msg = `File ID not found: ${coercedOpts.file_id}`
        console.debug('[useFilesStore] processFile aborted - file not found', { projectId, fileId: coercedOpts.file_id })
        set({ error: msg, logs: [msg, ...get().logs] })
        return
      }

      const res: ProcessResponse = await api.processFile(projectId, coercedOpts)
      console.debug('[useFilesStore] processFile success', { projectId, res })
      set({ logs: [JSON.stringify(res), ...get().logs] })
    } catch (e) {
      console.debug('[useFilesStore] processFile failed', { projectId, err: String(e) })
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isProcessing: false })
    }
  },
  pushIndex: async (projectId, doReset = false) => {
    console.debug('[useFilesStore] pushIndex start', { projectId, doReset })
    set({ isIndexing: true, error: null })
    try {
      const res = await api.pushIndex(projectId, doReset)
      console.debug('[useFilesStore] pushIndex success', { projectId, res })
      set({ logs: [JSON.stringify(res), ...get().logs] })
    } catch (e) {
      console.debug('[useFilesStore] pushIndex failed', { projectId, err: String(e) })
      set({ error: extractError(e as unknown), logs: [String(e), ...get().logs] })
    } finally {
      set({ isIndexing: false })
    }
  }
}))
