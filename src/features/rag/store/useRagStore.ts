import { create } from 'zustand'
import * as api from '../api/ragApi'
import { extractError } from '../../../core/api/apiException'
import type { SearchResultItem } from '../../../types/api.types'

interface RagState {
  results: SearchResultItem[]
  answer: string | null
  loading: boolean
  error: string | null
  search: (projectId: string, text: string, limit?: number, fileIds?: string[]) => Promise<void>
  ask: (projectId: string, text: string, limit?: number, fileIds?: string[]) => Promise<void>
}

export const useRagStore = create<RagState>((set) => ({
  results: [],
  answer: null,
  loading: false,
  error: null,
  search: async (projectId, text, limit = 5, fileIds = []) => {
    set({ loading: true, error: null })
    try {
      const res = await api.searchIndex(projectId, text, limit, fileIds)
      set({ results: res.search_result })
    } catch (e) {
      set({ error: extractError(e as unknown) })
    } finally {
      set({ loading: false })
    }
  },
  ask: async (projectId, text, limit = 5, fileIds = []) => {
    set({ loading: true, error: null })
    try {
      const res = await api.askQuestion(projectId, text, limit, fileIds)
      set({ answer: res.answer })
    } catch (e) {
      set({ error: extractError(e as unknown) })
    } finally {
      set({ loading: false })
    }
  }
}))
