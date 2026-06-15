// Local registry of projects the user has opened. The backend has no
// list/create endpoint (projects are auto-created on first access by id), so
// names and recency live in the browser. Replace this module with API calls
// once the backend exposes GET/POST /projects.

export interface RecentProject {
  id: string
  name: string
  lastOpenedAt: number
}

const STORAGE_KEY = 'rag_projects'
const LEGACY_KEY = 'rag_recent_projects'

function read(): RecentProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter(isRecentProject)
    }
    // One-time migration from the old `string[]` of ids.
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const ids = JSON.parse(legacy)
      if (Array.isArray(ids)) {
        const migrated: RecentProject[] = ids
          .filter((id): id is string => typeof id === 'string')
          .map((id, i) => ({ id, name: `Project ${id}`, lastOpenedAt: Date.now() - i }))
        write(migrated)
        return migrated
      }
    }
  } catch {
    // Corrupt storage — start fresh.
  }
  return []
}

function isRecentProject(value: unknown): value is RecentProject {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as RecentProject).id === 'string' &&
    typeof (value as RecentProject).name === 'string'
  )
}

function write(projects: RecentProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function listRecentProjects(): RecentProject[] {
  return read().sort((a, b) => b.lastOpenedAt - a.lastOpenedAt)
}

/** Record (or refresh) a project, preserving an existing name unless a new one is given. */
export function rememberProject(id: string, name?: string): RecentProject[] {
  const existing = read()
  const prior = existing.find((p) => p.id === id)
  const next: RecentProject = {
    id,
    name: (name && name.trim()) || prior?.name || `Project ${id}`,
    lastOpenedAt: Date.now()
  }
  const updated = [next, ...existing.filter((p) => p.id !== id)].slice(0, 24)
  write(updated)
  return listRecentProjects()
}

export function forgetProject(id: string): RecentProject[] {
  write(read().filter((p) => p.id !== id))
  return listRecentProjects()
}

export function getProjectName(id: string): string | undefined {
  return read().find((p) => p.id === id)?.name
}
