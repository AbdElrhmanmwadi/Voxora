import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import ProjectsPage from './features/projects/pages/ProjectsPage'
import ProjectDashboardPage from './features/projects/pages/ProjectDashboardPage'
import FilesPage from './features/files/pages/FilesPage'
import AskPage from './features/rag/pages/AskPage'
import TranslatePage from './features/translation/pages/TranslatePage'
import VoicePage from './features/voice/pages/VoicePage'
import AppShell from './core/layout/AppShell'

const router = createBrowserRouter([
  { path: '/', element: <AppShell><ProjectsPage /></AppShell> },
  { path: '/projects/:projectId', element: <AppShell><ProjectDashboardPage /></AppShell> },
  { path: '/projects/:projectId/files', element: <AppShell><FilesPage /></AppShell> },
  { path: '/projects/:projectId/ask', element: <AppShell><AskPage /></AppShell> },
  { path: '/projects/:projectId/translate', element: <AppShell><TranslatePage /></AppShell> },
  { path: '/projects/:projectId/voice', element: <AppShell><VoicePage /></AppShell> }
])

export default router
