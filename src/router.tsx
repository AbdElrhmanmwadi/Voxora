import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import ProjectsPage from './features/projects/pages/ProjectsPage'
import ProjectDashboardPage from './features/projects/pages/ProjectDashboardPage'
import FilesPage from './features/files/pages/FilesPage'
import AskPage from './features/rag/pages/AskPage'
import TranslatePage from './features/translation/pages/TranslatePage'
import VoicePage from './features/voice/pages/VoicePage'
import AppShell from './core/layout/AppShell'
import ProtectedRoute from './core/auth/ProtectedRoute'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'

function protectedPage(page: React.ReactNode) {
  return (
    <ProtectedRoute>
      <AppShell>{page}</AppShell>
    </ProtectedRoute>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/auth/verify-email', element: <VerifyEmailPage /> },
  { path: '/', element: protectedPage(<ProjectsPage />) },
  { path: '/projects/:projectId', element: protectedPage(<ProjectDashboardPage />) },
  { path: '/projects/:projectId/files', element: protectedPage(<FilesPage />) },
  { path: '/projects/:projectId/ask', element: protectedPage(<AskPage />) },
  { path: '/projects/:projectId/translate', element: protectedPage(<TranslatePage />) },
  { path: '/projects/:projectId/voice', element: protectedPage(<VoicePage />) }
])

export default router
