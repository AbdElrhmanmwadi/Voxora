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
import { useI18n } from './core/i18n'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

function App() {
  const { language } = useI18n()
  const app = (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )

  return googleClientId ? (
    <GoogleOAuthProvider key={language} clientId={googleClientId} locale={language}>
      {app}
    </GoogleOAuthProvider>
  ) : (
    app
  )
}

function Main() {
  return (
    <I18nProvider>
      <App />
    </I18nProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
