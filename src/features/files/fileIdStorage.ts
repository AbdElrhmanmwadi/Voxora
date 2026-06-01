const storageKey = (projectId: string) => `rag:lastFileId:${projectId}`

export function saveProjectFileId(projectId: string, fileId: string) {
  try {
    sessionStorage.setItem(storageKey(projectId), fileId)
  } catch {
    // Ignore quota / private-mode errors.
  }
}

export function getProjectFileId(projectId: string): string | null {
  try {
    return sessionStorage.getItem(storageKey(projectId))
  } catch {
    return null
  }
}
