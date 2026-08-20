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
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
        }
      },
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/docs': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/openapi.json': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/translate': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
