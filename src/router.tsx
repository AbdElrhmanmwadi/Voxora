import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import ProjectsPage from './features/projects/pages/ProjectsPage'
import ProjectDashboardPage from './features/projects/pages/ProjectDashboardPage'
import FilesPage from './features/files/pages/FilesPage'
import AskPage from './features/rag/pages/AskPage'
import TranslatePage from './features/translation/pages/TranslatePage'
import VoicePage from './features/voice/pages/VoicePage'

const router = createBrowserRouter([
  { path: '/', element: <ProjectsPage /> },
  { path: '/projects/:projectId', element: <ProjectDashboardPage /> },
  { path: '/projects/:projectId/files', element: <FilesPage /> },
  { path: '/projects/:projectId/ask', element: <AskPage /> },
  { path: '/projects/:projectId/translate', element: <TranslatePage /> },
  { path: '/projects/:projectId/voice', element: <VoicePage /> }
])

export default router
