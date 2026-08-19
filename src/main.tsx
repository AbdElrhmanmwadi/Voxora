import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './index.css'
import { AuthProvider } from './core/auth/AuthContext'
import { I18nProvider } from './core/i18n/I18nContext'
import { ThemeProvider } from './core/i18n/ThemeContext'
import Toaster from './core/ui/Toaster'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function Main() {
  const app = (
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  )

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
  ) : (
    app
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
