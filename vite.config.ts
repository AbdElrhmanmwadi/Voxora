import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // /auth/* is both an API prefix and a set of SPA routes
      // (/auth/reset-password, /auth/forgot-password, /auth/verify-email).
      // Only proxy API calls; let browser navigations render the React app.
      '/auth': {
        target: 'http://localhost:8000',
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        }
      },
      '/api/v1': 'http://localhost:8000',
      '/translate': 'http://localhost:8000'
    }
  }
})
