import axiosClient from '../../../core/api/axiosClient'

export type ApiProject = { id?: string | number; project_id?: string | number; name?: string; title?: string }

export async function listProjects(): Promise<ApiProject[]> {
  const response = await axiosClient.get('/api/v1/projects')
  const data = response.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.projects)) return data.projects
  if (Array.isArray(data?.data)) return data.data
  return []
}
